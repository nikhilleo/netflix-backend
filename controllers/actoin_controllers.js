require("dotenv").config();
const download = require('image-downloader')
const cloudinary = require('cloudinary').v2;
var action_data = [];
const Axios = require("axios");
const yts = require('yt-search')
const fs = require("fs");
const Action = require("../models/action");
// const TorrentSearchApi = require('torrent-search-api');
// var Youtube = require('youtube-video-api')
var WebTorrent = require('webtorrent')
// const { upload } = require('youtube-videos-uploader');
// const credentials = { email: 'ramrakhyani94@gmail.com', pass: '8983289771nr', recoveryemail: 'ramrakhyani94@gmail.com' }
cloudinary.config({
    cloud_name: 'uccrgo5202',
    api_key: '448152779933652',
    api_secret: 'cYf_aqrJ75P1eIGAHu9a3uyOYCE'
});


exports.updateAction = async (req, res) => {
    try {
        console.log("In Try");
        const pos_deleted = await cloudinary.api.delete_resources_by_prefix("ActionPosters/")
        console.log(pos_deleted);
        const car_deleted = await cloudinary.api.delete_resources_by_prefix('ActionCarousal/')
        console.log(car_deleted);
        await Action.deleteMany({});
        const originals = await Axios.get(`${process.env.TMDB_BASE_URL}${process.env.fetchActionMovies}`)
        action_data = originals.data.results;
        for (let i = 0; i < action_data.length; i++) {
            if (action_data[i].title || action_data[i].name) {
                const data = {
                    tmdb_id: action_data[i].id,
                    name: action_data[i].title || action_data[i].name,
                    overview: action_data[i].overview,
                    date_of_release: action_data[i].release_date || action_data[i].first_air_date,
                    language: action_data[i].original_language,
                    avg_votes: action_data[i].vote_average,
                }
                if (action_data[i].title) {
                    var options = {
                        url: process.env.BACK_IMAGE_URL + action_data[i].poster_path,
                        dest: `./PosterUploads/${action_data[i].title}.jpg`,
                    }
                } else if (action_data[i].name) {
                    var options = {
                        url: process.env.BACK_IMAGE_URL + action_data[i].poster_path,
                        dest: `./PosterUploads/${action_data[i].name}.jpg`,
                    }
                }
                download.image(options)
                    .then(async ({
                        filename
                    }) => {
                        if (filename) {
                            const img_url = await cloudinary.uploader.upload(filename, {
                                folder: "ActionPosters/"
                            });
                            data.poster_img = img_url.url
                            var cnt = 1;
                            if (cnt == 1) {
                                const r = await yts(`${data.name} English Dubbed Final Trailer ${data.date_of_release.split("-")[0]}`)
                                const trailer_url = getURL(r.all, data.name)
                                data.trailer_url = trailer_url
                                cnt++;
                            }
                            const action = await new Action(data);
                            await action.save();
                            carousal_downUp(action._id, action.name, process.env.BACK_IMAGE_URL + action_data[i].backdrop_path);
                            fs.unlink(filename, (err) => {
                                if (err) console.log(err)
                                else
                                    console.log(`Deleted file: ${filename}`);
                            });
                        }
                    })
                    .catch((err) => console.log(err))
            }
        }
        res.send("Updated Action");
    } catch (error) {
        console.log(error);
        res.send(error.message)

    }
}


function carousal_downUp(id, name, url) {
    const options = {
        url: url,
        dest: `./CarousalUploads/${name}.jpg`,
    }
    download.image(options)
        .then(async ({
            filename
        }) => {
            if (filename) {
                const img_url = await cloudinary.uploader.upload(filename, {
                    folder: "ActionCarousal/"
                });
                const data = await Action.findByIdAndUpdate({
                    _id: id
                }, {
                    carousal_img: img_url.url
                });
                fs.unlink(filename, (err) => {
                    if (err) console.log(err)
                    else
                        console.log(`Deleted file: ${filename}`);
                });
            }

        })
}


function getURL(data, name1) {
    var flag = 0;
    var goodLinks = []
    const name = name1.toLowerCase()
    for (let i = 0; i < data.length; i++) {
        var title = data[i].title.toLowerCase();
        if (title.includes(":")) {
            title.replace(":", "");
        }
        if (title.includes(`${name}`) && title.includes("official") && data[i].seconds < 180) {
            goodLinks.push(data[i].url);
        }
    }
    if (goodLinks.length < 1) {
        console.log(data.length);
        for (let i = 0; i < data.length; i++) {
            if (data[i].seconds < 240)
                goodLinks.push(data[i].url)
        }
    }
    return goodLinks;
}



exports.getAction = async (req, res) => {
    // res.send("Trending Get");
    try {
        const allAction = await Action.find({});
        if (allAction.length < 1) {
            throw new Error("No Action Data");
        } else {
            res.status(200).send(allAction);
        }
    } catch (error) {
        if (error.message == "No Action Data") {
            res.status(404).send(error.message)
        }
    }
}


exports.downloadOne = async (req, res) => {
    try {
        const actionData = await Action.find({});
        var client = new WebTorrent();
        const TorrentSearchApi = require('torrent-search-api');
        TorrentSearchApi.enablePublicProviders();
        // TorrentSearchApi.enableProvider("1337x");
        const isActive = TorrentSearchApi.isProviderActive('1337x');
        console.log(isActive);
        const torrents = await TorrentSearchApi.search(`${actionData[4].name}`, "Movies", 20);
        console.log(torrents);
        const magnetURI = await TorrentSearchApi.getMagnet(torrents[4]);
        console.log(magnetURI);
        const opts = {
            path: "./Movies"
        }
        await client.add(magnetURI, opts, function (torrent) {
            // Got torrent metadata!
            console.log("ADDED");
            console.log('Client is downloading:', torrent.infoHash)
            console.log(torrent.path);
            console.log(torrent.downloadSpeed);
            torrent.files.forEach(function (file) {
                // Display the file by appending it to the DOM. Supports video, audio, images, and
                // more. Specify a container element (CSS selector or reference to DOM node).
                console.log(file)
                //   file.appendTo('body')
            })
            torrent.on('download', function (chunkSize) {
                console.log('chunk size: ' + chunkSize);
                console.log('total downloaded: ' + torrent.downloaded);
                console.log('download speed: ' + torrent.downloadSpeed);
                console.log('progress: ' + torrent.progress);
                console.log('======');
            })
            torrent.on('done', function () {
                console.log('torrent finished downloading');
                torrent.files.forEach(function (file) {
                    console.log(file.path);
                })
            })
        })
        res.send("Done")
        // TorrentSearchApi.enablePublicProviders();
        // // Search '1080' in 'Movies' category and limit to 20 results
        // res.send(`Found Torrents ${actionData[4]}`);
        // await TorrentSearchApi.downloadTorrent(magnet,"./Movies")
    } catch (error) {
        console.log(error.message);
    }
}


exports.uploadOne = async (req, res) => {
    try {
        var ResumableUpload = require('node-youtube-resumable-upload');
        metadata = {
            snippet: {
                title: `My First Upload`,
                description: `My First Upload`
            },
            status: {
                privacyStatus: 'private'
            }
        }
        var resumableUpload = new ResumableUpload(); //create new ResumableUpload
        resumableUpload.tokens = tokens; //Google OAuth2 tokens
        resumableUpload.filepath = '../Movies/lesson4.mp4';
        resumableUpload.metadata = metadata; //include the snippet and status for the video
        resumableUpload.retry = 3; // Maximum retries when upload failed.
        resumableUpload.upload();
        resumeableUpload.on('progress', function (progress) {
            console.log(progress);
        });
        resumableUpload.on('success', function (success) {
            console.log(success);
        });
        resumableUpload.on('error', function (error) {
            console.log(error);
        });

    } catch (error) {
        console.log(error.message)
        res.status(400).send(error.message)
    }

    // try {
    //     const video1 = { path: '../Movies/lesson4.mp4', title: 'Tom.and.Jerry.2021.1080p.WEBRip.DD5.1.x264-CM', description: 'Tom.and.Jerry.2021.1080p.WEBRip.DD5.1.x264-CM Full Movie' }
    //     const playlist = { create: false, name: 'Movies' }
    //     console.log("Uploading");
    //     const link = await upload (credentials, [video1])
    //     console.log(link)
    //     res.status(200).send("Uploaded")
    // }
    // catch(error)
    // {
    //     console.log(error.message)
    //     res.status(400).send(error.message)
    // }
}
// try {
//     var youtube = Youtube({ 
//         video: {
//           part: 'status,snippet' 
//         },
//         email: 'ramrakhyani94@gmail.com',
//         password: '8983289771n'   
//     })
//     const actionData = await Action.find({});
//     var params = {
//         resource: {
//           snippet: {
//             title: `${actionData[4].name}`,
//             description: `${actionData[4].overview}`
//           },
//           status: {
//             privacyStatus: 'private'
//           }
//         }
//       }
//       youtube.authenticate('389309325673-l25uor6bjgtlhtj7ptqi2ks1a5lpdblg.apps.googleusercontent.com', 'xdCcac2c7ZKo4G0K7e9pn-mT', function (err, tokens) {
//         if (err) return console.error('Cannot authenticate:', err.message)
//         console.log(tokens);
//         uploadVideo()
//       })

//       function uploadVideo() {
//         console.log("in upload")
//         youtube.upload("../Movies/Tom.and.Jerry.2021.1080p.WEBRip.DD5.1.x264-CM/Tom.and.Jerry.2021.1080p.WEBRip.DD5.1.x264-CM.mkv", params, function (err, video) {
//           // 'path/to/video.mp4' can be replaced with readable stream. 
//           // When passing stream adding mediaType to params is advised.
//           if (err) {
//             return console.error('Cannot upload video:', err)
//           }
//           console.log('Video was uploaded with ID:', video.id)
//         })
//       }
// } catch (error) {
//     console.log(error.message);
// }
// }


