'use strict';

const request = require('request');
const { clientId, clientSecret, authorizationURL, redirectURI, accessTokenURL } = require('../config');

class API {
    static askUploadImage(req, linkedinId,token) {
        const url = 'https://api.linkedin.com/v2/assets?action=registerUpload';
        const body = {
            registerUploadRequest: {
                owner: 'urn:li:person:' + linkedinId,
                recipes: [
                    "urn:li:digitalmediaRecipe:feedshare-image"
                ],
                serviceRelationships: [
                    {
                        identifier: "urn:li:userGeneratedContent",
                        relationshipType: "OWNER"
                    }
                ]
            }
        }
        const headers = {
            'Authorization': 'Bearer ' + token,
            'cache-control': 'no-cache',
            'X-Restli-Protocol-Version': '2.0.0',
            'x-li-format': 'json'
        };
        return new Promise((resolve, reject) => {
            request.post({ url: url, json: body, headers: headers}, (err, response, body) => {
                if(err) {
                    reject(err);
                }
                console.log("BODY",JSON.stringify(body.value.uploadMechanism["com.linkedin.digitalmedia.uploading.MediaUploadHttpRequest"]))
                resolve(body);
            });
        });
    }
 
    static publishContent(req, linkedinId, content,token) {
        console.log("TOKEN:",token)
        //const url = 'https://api.linkedin.com/v2/shares';
        const owner = 'urn:li:person:' + linkedinId;
        const action = 'urn:li:activity:6773648723126882305'
        const encoded = encodeURIComponent(action);
        // const url = 'https://api.linkedin.com/v2/people/id:'+linkedinId
        // const url = `https://api.linkedin.com/v2/socialActions/${encoded}`
        const url = "https://www.linkedin.com/posts/percy-vier_probando-las-apis-de-linkedin-esto-es-un-activity-6773648723126882305-fkGA"
        
        console.log(encoded)
        const { title, text, shareUrl, shareThumbnailUrl } = content;
        // const body = {
        //     owner: 'urn:li:person:' + linkedinId,
        //     subject: title,
        //     text: {
        //         text: text
        //     },
        //     content: {
        //         contentEntities: [
        //           {
        //             entity: "urn:li:digitalmediaAsset:C4E22AQFLx6qkYVDnhw"
        //           }
        //         ],
        //         title: "Test Share with Content title",
        //         landingPageUrl: "https://www.linkedin.com/",
        //         shareMediaCategory: "IMAGE"
        //       },
        //     distribution: {
        //         linkedInDistributionTarget: {}
        //     }
        // };
        const headers = {
            'Authorization': 'Bearer ' + token,
            'cache-control': 'no-cache',
            'X-Restli-Protocol-Version': '2.0.0',
            'x-li-format': 'json'
        };
        //console.log("HEADERS: ", headers)
        return new Promise((resolve, reject) => {
            request.get({ url: url, headers: headers}, (err, response, body) => {
            // request.post({ url: url, json: body, headers: headers}, (err, response, body) => {
                if(err) {
                    reject(err);
                }
                // console.log("Response:", response)
                console.log("Body:", body)
                resolve(body);
            });
        });

    }

    static getLinkedinId(req,token) {
        console.log("getLinkedinId");
        return new Promise((resolve, reject) => {
            const url = 'https://api.linkedin.com/v2/me';
            const headers = {
                'Authorization': 'Bearer ' + token,
                'cache-control': 'no-cache',
                'X-Restli-Protocol-Version': '2.0.0' 
            };

            request.get({ url: url, headers: headers }, (err, response, body) => {
                if(err) {
                    reject(err);
                }
                console.log("ID",JSON.parse(body).id)
                resolve(JSON.parse(body).id);
                
            });
        });
    }

    static getAccessToken(req) {
        const { code } = req.query;
        const body = {
            grant_type: 'authorization_code',
            code: code,
            redirect_uri: redirectURI,
            client_id: clientId,
            client_secret: clientSecret
        };
        return new Promise((resolve, reject) => {
            request.post({url: accessTokenURL, form: body }, (err, response, body) =>
        { 
            if(err) {
                reject(err);
            }
            resolve(JSON.parse(body));
        }
        );
        });
    }

    static getAuthorizationUrl() {
        const state = Buffer.from(Math.round( Math.random() * Date.now() ).toString() ).toString('hex');
        const scope = encodeURIComponent('w_member_social r_liteprofile r_basicprofile r_organization_social rw_organization_admin');
        const url = `${authorizationURL}?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectURI)}&state=${state}&scope=${scope}`;
        console.log(url)
        return url;
    }
}

module.exports = API;