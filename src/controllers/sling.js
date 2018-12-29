const Controller = require('./controller');
const rp = require('request-promise');
const he = require('he');
const m3u8 = require('m3u8');
const url = require('url');
const uuidv4 = require('uuid/v4');
const XmlJs = require('xml2js');

const XmlParser = new XmlJs.Parser();
const widevineUrl = 'http://p-drmwv.movetv.com/proxy';
const fairplayCertUrl = 'http://p-drmfp.movetv.com/fairplay/certificate';
const fairplayCkc = 'http://p-drmfp.movetv.com/fairplay/';
const playreadyUrl = 'http://p-playready.movetv.com/playready/rightsmanager.asmx';
const disneySignUrl = 'https://p-cmw.movetv.com/cmw/v1/rsa/sign';
const disneyPlaybackUrl = 'https://api.partners.abc.com/watch/apis/partners/v1/playmanifest';
const stream = require('stream');

class Sling extends Controller {
  constructor() {
    super();
    this.collection = 'sling';
  }

  async getScheduleJson(ctx) {
    try {
      ctx.body = await this.getScheduleJsonHelper(ctx);
      ctx.type = 'application/json';
    } catch (err) {
      ctx.status = 500;
      ctx.body = err.message;
    }
  }

  async getStream(ctx) {
    try {
      ctx.body = await this.getStreamHelper(ctx, ctx.params.channelId);
      ctx.type = 'application/dash+xml';
    } catch (err) {
      ctx.status = 500;
      ctx.body = err.message;
    }
  }

  async getLogo(ctx) {
    try {
      ctx.body = await this.getLogoHelper(ctx, ctx.params.title);
      if (!ctx.body) {
        ctx.status = 404;
      } else {
        ctx.type = 'image/png';
        const age = 86400;
        ctx.set('Cache-Control', `max-age=${age}`);
      }
    } catch (err) {
      ctx.status = 500;
      ctx.body = err.message;
    }
  }

  async getFairplayStream(ctx) {
    try {
      ctx.body = await this.getFairplayStreamHelper(ctx, ctx.params.channelId);
      ctx.type = 'application/x-mpegURL';
    } catch (err) {
      ctx.status = 500;
      ctx.body = err.message;
    }
  }

  async getFairplayVariant(ctx) {
    try {
      ctx.body = await this.getFairplayVariantHelper(ctx, ctx.params.channelId, ctx.params.quality);
      ctx.type = 'application/x-mpegURL';
    } catch (err) {
      ctx.status = 500;
      ctx.body = err.message;
    }
  }

  async getDisneyStream(ctx) {
    try {
      ctx.body = await this.getDisneyStreamHelper(ctx.params.brand);
    } catch (err) {
      ctx.status = 500;
      ctx.body = err.message;
    }
  }

  async getFairplayCert(ctx) {
    const options = { url: fairplayCertUrl, encoding: null };
    try {
      ctx.body = await rp.get(options);
      ctx.type = 'application/octet-stream';
    } catch (err) {
      ctx.status = 500;
      ctx.body = err.message;
    }
  }

  async processFairplayCert(ctx) {
    const reqUrl = fairplayCkc + ctx.params.channelId;
    const options = { url: reqUrl, body: ctx.text, encoding: null };
    try {
      ctx.body = await rp.post(options);
      ctx.type = 'application/octet-stream';
    } catch (err) {
      ctx.status = 500;
      ctx.body = err.message;
    }
  }

  async processPlayready(ctx) {
    const options = { url: playreadyUrl, body: ctx.text, encoding: null };
    try {
      ctx.body = await rp.post(options);
      ctx.type = 'application/octet-stream';
    } catch (err) {
      ctx.status = 500;
      ctx.body = err.message;
    }
  }

  async processWidevine(ctx) {
    const drmBody = {
      env: 'production',
      user_id: uuidv4(),
      channel_id: '175ca5261a83db31c5df434a9f7218b1',
      message: [...ctx.text]
    };
    const options = {
      url: widevineUrl,
      body: drmBody,
      json: true,
      encoding: null
    };
    try {
      ctx.body = await rp.post(options);
      ctx.type = 'application/octet-stream';
    } catch (err) {
      ctx.status = 500;
      ctx.body = err.message;
    }
  }

  getDisneyStreamHelper(brand) {
    const d = new Date();
    const timestamp = Math.round(d.getTime() / 1000);
    const user = uuidv4();
    return rp.get({ url: disneySignUrl, form: { document: `${user}_${timestamp}_`, json: true } }).then(sig => {
      const sigJSON = JSON.parse(sig);
      const newForm = {
        device: '001_14',
        video_type: 'live',
        brand,
        token_type: 'offsite.dish_ott',
        token: sigJSON.signature,
        user_id: user,
        affiliate: null,
        zipcode: '90014',
        ak: 'fveequ3ecb9n7abp66euyc48',
        locale: 'US/Pacific'
      };
      return rp.post({ url: disneyPlaybackUrl, form: newForm }).then(playbackXml => {
        return new Promise((resolve, reject) => {
          XmlParser.parseString(playbackXml, (err, result) => {
            if (err) {
              reject(err);
            }
            resolve(result.playmanifest.channel[0].assets[0].asset[0]._.replace('http://', 'https://'));
          });
        });
      });
    });
  }

  getScheduleJsonHelper(ctx) {
    const cacheId = 'sling-schedule';
    return ctx.cachePromise(cacheId).then(reply => {
      if (reply) {
        return JSON.parse(reply);
      }
      const items = { items: [] };
      return this.getRawSchedule(ctx).then(res => {
        const promises = [];
        res.channels.forEach(channel => {
          // let thumbnail = channel.image && channel.image.url ? channel.image.url : null
          const thumbnail = `/api/1/channels/${encodeURIComponent(channel.channel_name)}/logo.png`;
          const item = {
            channel: {
              // title: Buffer.from(channel.channel_name).toString('base64'),
              title: he.encode(channel.channel_name),
              stream_url: `/api/1/sling/${channel.guid}.mpd`,
              desc_image: thumbnail,
              drm: {
                protocol: 'mpd',
                type: 'com.widevine.alpha',
                license_url: '/api/1/sling/yGsZQrFlUn'
              },
              description: null,
              category_id: null
            }
          };
          const options = { url: channel.current_asset, simple: false, json: true };
          promises.push(ctx.cachePromise(channel.current_asset).then(assetReply => {
            if (assetReply) {
              if (assetReply !== 'noop') {
                items.items.push(JSON.parse(assetReply));
              }
              return true;
            }
            return rp.get(options)
              .then(asset => {
                let disneyPromise = null;
                let disneyCache = null;
                const disneyBrand = channel.disney_brand_code;
                if (disneyBrand) {
                  disneyPromise = this.getDisneyStreamHelper(disneyBrand).then(hlsUrl => {
                    disneyCache = 60;
                    item.channel.hls_url = hlsUrl;
                  });
                }
                return Promise.resolve(disneyPromise).then(() => {
                  if (asset && asset.title) {
                    item.channel.assetTitle = asset.title;
                  }
                  if (Array.isArray(asset.schedules) && asset.schedules.length > 0) {
                    const timeLeft = new Date(asset.schedules[0].schedule_end) - new Date();
                    let cacheTime = parseInt(timeLeft / 1000, 10);
                    cacheTime = disneyCache || cacheTime;
                    if (cacheTime > 0) {
                      ctx.cache.setex(channel.current_asset, cacheTime, JSON.stringify(item));
                      items.items.push(item);
                    } else {
                      ctx.cache.setex(channel.current_asset, 86400, 'noop');
                    }
                  } else {
                    ctx.cache.setex(channel.current_asset, 86400, 'noop');
                  }
                });
              });
          }));
        });
        return Promise.all(promises).then(() => {
          ctx.cache.setex(cacheId, 10, JSON.stringify(items));
          return items;
        });
      });
    });
  }


  getLogoHelper(ctx, channelName) {
    const cacheId = `sling-image-${channelName}`;
    return ctx.cachePromise(cacheId).then(reply => {
      if (reply) {
        return Buffer.from(reply, 'base64');
      }
      return this.getRawSchedule(ctx).then(res => {
        const channel = res.channels.find(x => x.channel_name === channelName);
        if (channel && channel.image && channel.image.url) {
          return rp.get({ url: channel.image.url, encoding: null }).then(img => {
            ctx.cache.setex(cacheId, 86400, img.toString('base64'));
            return img;
          });
        }
      });
    });
  }

  getStreamHelper(ctx, channelId) {
    return ctx.cachePromise(channelId).then(reply => {
      if (reply) {
        return reply;
      }
      const infoApi = `http://cbd46b77.cdn.cms.movetv.com/cms/api/channels/${channelId}/schedule/now/playback_info.qvt`;
      return rp.get({ url: infoApi, json: true }).then(res => {
        return rp.get(res.playback_info.dash_manifest_url).then(dash => {
          return new Promise((resolve, reject) => {
            XmlParser.parseString(dash, (err, result) => {
              if (err) {
                reject(err);
              } else {
                result.MPD.Period.forEach(period => {
                  period.BaseURL.forEach(baseUrl => {
                    baseUrl._ = baseUrl._.replace('http://', 'https://');
                  });
                });
                const currentTime = new Date();
                const anchor = new Date(res.playback_info.linear_info.anchor_time);
                const duration = parseFloat(result.MPD.$.mediaPresentationDuration.replace('PT', ''));
                let cacheTime = duration - ((currentTime / 1000) - anchor);
                cacheTime = parseInt(cacheTime, 10);
                const builder = new XmlJs.Builder();
                const newDash = builder.buildObject(result);
                if (cacheTime > 0) {
                  ctx.cache.setex(channelId, cacheTime, newDash);
                }
                resolve(newDash);
              }
            });
          });
        });
      });
    });
  }

  getFairplayStreamHelper(ctx, channelId) {
    const cacheId = `fairplay-${channelId}`;
    return ctx.cachePromise(cacheId).then(reply => {
      if (reply) {
        return reply;
      }
      const infoApi = `http://cbd46b77.cdn.cms.movetv.com/cms/api/channels/${channelId}/schedule/now/playback_info.qvt`;
      return rp.get({ url: infoApi, json: true }).then(res => {
        const hlsUrl = res.playback_info.dash_manifest_url.replace('.mpd', '/master_7_3_fairplay.m3u8');
        return rp.get(hlsUrl).then(hls => {
          return new Promise(resolve => {
            const parser = m3u8.createStream();
            const file = new stream.PassThrough();
            file.write(hls);
            file.end();
            file.pipe(parser);
            parser.on('item', item => {
              if (item.properties.uri) {
                const variantUrl = url.resolve(hlsUrl, item.properties.uri);
                item.properties.uri = `${channelId}/${item.attributes.attributes.bandwidth}.m3u8`;
                const variantCacheId = `${cacheId}-${item.attributes.attributes.bandwidth}`;
                ctx.cache.setex(variantCacheId, 10, variantUrl);
              }
              if (item.attributes.attributes.uri) {
                const variantCacheId = `${cacheId}-${item.attributes.attributes['group-id']}`;
                const variantUrl = url.resolve(hlsUrl, item.attributes.attributes.uri);
                item.attributes.attributes.uri = `${channelId}/${item.attributes.attributes['group-id']}.m3u8`;
                ctx.cache.setex(variantCacheId, 10, variantUrl);
              }
            });
            parser.on('m3u', m3u => {
              const m3uString = m3u.toString();
              ctx.cache.setex(cacheId, 10, m3uString);
              resolve(m3uString);
            });
          });
        });
      });
    });
  }

  getVariantUrl(ctx, cacheId, channelId) {
    // try to get variant url from cache
    return ctx.cachePromise(cacheId).then(reply => {
      if (!reply) {
        return this.getFairplayStreamHelper(ctx, channelId).then(() => {
          // retry from cache
          return ctx.cachePromise(cacheId).then(retryReply => {
            if (retryReply) {
              return retryReply;
            }
            return null;
          });
        });
      }
      return reply;
    });
  }

  getFairplayVariantHelper(ctx, channelId, quality) {
    const cacheId = `fairplay-${channelId}-${quality}`;
    const anchorCacheId = `anchor-${channelId}-${quality}`;
    return ctx.cachePromise(anchorCacheId).then(reply => {
      if (reply) {
        const anchor = JSON.parse(reply);
        const currDate = new Date();
        const startDate = new Date(anchor.time);
        const timeDiff = (currDate - startDate) / 1000;
        const segmentNum = anchor.segmentNum + parseInt(timeDiff / 2.048, 10);
        if (segmentNum > 42186) {
          return this.buildVariantUrl(ctx, cacheId, channelId, anchorCacheId);
        }
        return this.buildFairplayVariant(segmentNum, anchor);
      }
      return this.buildVariantUrl(ctx, cacheId, channelId, anchorCacheId);
    });
  }

  pad(num, size) {
    let s = `${num}`;
    while (s.length < size) s = `0${s}`;
    return s;
  }

  buildFairplayVariant(segmentNum, anchor) {
    const startSegment = segmentNum - 10;
    const variantArr = [`#EXTM3U
#EXT-X-TARGETDURATION:3
#EXT-X-VERSION:7
#EXT-X-MEDIA-SEQUENCE:${segmentNum - 10}`];
    for (let i = startSegment; i <= segmentNum; i += 1) {
      const hex = this.pad(i.toString(16), 4);
      let segment = anchor.segmentTemplate.replace('{{HEX}}', hex.toUpperCase());
      segment = segment.replace('http://', 'https://');
      variantArr.push(`#EXT-X-KEY:METHOD=SAMPLE-AES,KEYFORMAT="com.apple.streamingkeydelivery",KEYFORMATVERSIONS="1",URI="skd://watch.torula.com/api/1/sling/g1Ilryrq0i/${anchor.currKey}"
#EXTINF:2.048,
${segment}`);
    }
    return variantArr.join('\n');
  }

  buildVariantUrl(ctx, cacheId, channelId, anchorCacheId) {
    return this.getVariantUrl(ctx, cacheId, channelId).then(hlsUrl => {
      return rp.get(hlsUrl).then(hls => {
        // break up HLS
        const hlsArr = hls.split('\n').filter(Boolean);
        // get templates for last segment
        let segmentTemplate = hlsArr[hlsArr.length - 1];
        let keyTemplate = hlsArr[hlsArr.length - 3];
        // get extension-less ts file
        const noExt = segmentTemplate.split('.').slice(0, -1).join('.');
        // get domain path to segment
        segmentTemplate = url.resolve(hlsUrl, segmentTemplate).replace(`${noExt.slice(-4)}.`, '{{HEX}}.');
        // get the hex number from the last segment and convert to decimal
        const segmentNum = parseInt(`0x${noExt.slice(-4)}`, 16);
        keyTemplate = keyTemplate.match(/URI="skd:\/\/.*\/(.*)"/);
        const anchor = {
          time: new Date(), segmentNum, segmentTemplate, currKey: keyTemplate[1]
        };
        ctx.cache.set(anchorCacheId, JSON.stringify(anchor));
        return this.buildFairplayVariant(segmentNum, anchor);
      });
    });
  }

  getRawSchedule(ctx) {
    const cacheId = 'raw-sling-schedule';
    return ctx.cachePromise(cacheId).then(reply => {
      if (reply) {
        return JSON.parse(reply);
      }
      return rp.get({ url: 'http://cbd46b77.cdn.cms.movetv.com/cms/api/channels/', json: true }).then(schedule => {
        ctx.cache.setex(cacheId, 10, JSON.stringify(schedule));
        return schedule;
      });
    });
  }
}

module.exports = Sling;
