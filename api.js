const Router = require('express').Router;
const router = new Router();
const googleapis = require('googleapis');

var youtube = googleapis.youtube('v3');

var API_KEY = 'AIzaSyBW_32OmhMqep7C7AxbsgXVLrNh0-1_eM0'; // specify your API key here

var current

router.get('/youtube/jessicaschannel', (req, res, err) => {
	youtube.playlistItems.list({
		key: API_KEY,
		part: 'snippet',
		playlistId: 'UUkmdNARD7bwvj2xlMotWoyg',
		maxResults: 10,
		pageToken: (req.param('nextPageToken') ? req.param('nextPageToken') : '')
	}, function(err, result) {
		if (err) {
			res.send({
				items:[]
			})
		}
		if (result != null && result.items) {
			res.send(result)
		} 
	})
})


module.exports = router;