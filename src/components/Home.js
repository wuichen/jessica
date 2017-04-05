import React from "react";
import { connect } from "react-redux";
import $ from 'jquery';
import classnames from 'classnames';
import YTPlayer from 'yt-player';

// Home page component
export class Home extends React.Component {

	constructor(props)  {
	    super(props);
	    this.state = {
	    	isSmallIntro: false,
	    	hideVideos: true,
	    	hideOverlay: false,
	    	showVideo: false,
	    	player: null
	   	};
	}

	componentDidMount() {
		this.props.dispatch({type: 'FETCH_JESSICA_CHANNEL_LIST'});
		let thisComponent = this;

		$(window).on('scroll', function() {
		    var scrollTop = $(this).scrollTop();

		    if (scrollTop < 100) {
		    	thisComponent.setState({
		    		isSmallIntro: false,
		    		hideVideos: true
		    	})
		    } else {
		    	thisComponent.setState({
		    		isSmallIntro: true,
		    		hideVideos: false,
		    		hideOverlay: false,
		    		showVideo: false
		    	})
		    }
		});

		setInterval(() => {
			$('.fa-play-circle-o').toggleClass('react')
		}, 200)
	}

	componentWillReceiveProps(nextProps) {
		console.log(nextProps);
		if (nextProps.selectedVideo && !this.state.player) {
			this.setState({
				player: new YTPlayer('#youtube-player', {
					autoplay: false,
					related: false
				})
			})
		}
	}

	componentDidUpdate() {
		if (this.props.selectedVideo) {
			if (this.state.player.videoId != this.props.selectedVideo.snippet.resourceId.videoId) {
				this.state.player.load(this.props.selectedVideo.snippet.resourceId.videoId, false);
			}
		}
	}

	playVideo() {
		this.state.player.play();
		let thisComponent = this;
		this.setState({
    		isSmallIntro: true,
    		hideVideos: true,
    		hideOverlay: true
    	})

    	// hideOverlay and showVideo share the same value, but need to be execute differently
    	// due to the necessity of delay for showVideo's z-index transition
    	setTimeout(() => {
    		thisComponent.setState({
    			showVideo: true
    		})
    	}, 1000)
	}

	selectVideo(video) {
		// console.log(video)
		this.props.dispatch({
			type: 'SELECT_VIDEO',
			video: video
		})
	}

  	// render
  	render() {
  		if (this.state.player) {
			this.state.player.on('paused', () => {
				this.setState({
					hideOverlay: false,
					showVideo: false,
					hideVideos: false,
					isSmallIntro: true
				})
				window.scroll(0,150) 
			})
		}
		let dateString;
		if (this.props.selectedVideo) {
			let date = new Date(this.props.selectedVideo.snippet.publishedAt);
			dateString = 'Published At: ' + date.getUTCFullYear() + '.' + date.getUTCMonth() + '.' + date.getUTCDate()
		}

	    return (
	      	<div className="page-home">
	      		<div className={classnames('overlay', { onHide: this.state.hideOverlay})}></div>
      			<div className={classnames('main-intro', { onHide: this.state.showVideo, onMoveTop: this.state.isSmallIntro})}>
      				<p className='main-title'>Jessica's vlog</p>
      				<p className='main-sub'>Make up, lookbook, and travel</p>
      				{!this.state.isSmallIntro && (
      					<p>
      						<a href='#' onClick={() => {this.playVideo()}}>
      							<i className="fa fa-play-circle-o" aria-hidden="true"></i>
							</a>
						</p>
					)}
      			</div>
				<div className={classnames('video-background', { showVideo: this.state.showVideo, noBlur: this.state.hideOverlay})}>
				    <div className="video-foreground">
				    	<div id='youtube-player'></div>
				    </div>
				</div>

				<div className={classnames('video-library', { onHide: this.state.hideVideos})}>
					<div className='scrolls'>
						{this.props.jChannelList && this.props.jChannelList.map((video) => {
							let date = new Date(video.snippet.publishedAt);
							let dateString = date.getUTCFullYear() + '.' + date.getUTCMonth() + '.' + date.getUTCDate()
							let divStyle = {
						      backgroundImage: 'url(' + video.snippet.thumbnails.medium.url + ')'
						    };
							return (
								<div
									style={divStyle} 
									className='videoCard' 
									key={video.id}
									onClick={() => {
										this.selectVideo(video);
									}}>
									<div className='videoCard-desc'>
										{video.snippet.title}
										<br />
										<br />
										{dateString}
									</div>
								</div>
							)
						})}
					</div>
				</div>

				<div className={classnames('video-details', { onHide: this.state.hideVideos})}>
					<h2>
						{this.props.selectedVideo && this.props.selectedVideo.snippet.title}
					</h2>
					<div className='playBox'>
						<a href='#' onClick={() => {this.playVideo()}}>
      						<i className="fa fa-play-circle-o" aria-hidden="true"></i>
						</a>
					</div>
					<p>
						{dateString && (
							<strong>
								{dateString}
								<br />
							</strong>
						)}
						{this.props.selectedVideo && this.props.selectedVideo.snippet.description}
					</p>
				</div>
	      	</div>
	    );
  }
}
function mapStateToProps(state) {
  	return {
  		jChannelList: state.videos.jChannelList,
  		selectedVideo: state.videos.selectedVideo
  	};
}
export default connect(mapStateToProps)(Home);
