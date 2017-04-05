const Router = require('express').Router;
const router = new Router();
const googleapis = require('googleapis');

var youtube = googleapis.youtube('v3');

var API_KEY = 'AIzaSyBW_32OmhMqep7C7AxbsgXVLrNh0-1_eM0'; // specify your API key here

router.get('/youtube/jessicaschannel', (req, res, err) => {
	youtube.playlistItems.list({
		key: API_KEY,
		part: 'snippet',
		playlistId: 'UUkmdNARD7bwvj2xlMotWoyg',
		maxResults: 50
	}, function(err, result) {
		if (err) {
			res.send([])
		}
		if (result.items) {
			res.send(result.items)
		}
	})
})


module.exports = router;