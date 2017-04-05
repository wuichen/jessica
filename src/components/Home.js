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

		    if (scrollTop < 50) {
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
	}

	componentWillReceiveProps(nextProps) {
		if (nextProps.selectedVideo) {
			this.setState({
				player: new YTPlayer('#youtube-player')
			})
		}
	}

	componentDidUpdate() {
		if (this.props.selectedVideo) {
			if (this.state.player.videoId != this.props.selectedVideo.snippet.resourceId.videoId) {
				this.state.player.load(this.props.selectedVideo.snippet.resourceId.videoId);
			}
		}
	}

	playVideo() {
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
			})
		}
	    return (
	      	<div className="page-home">
	      		<div className={classnames('overlay', { onHide: this.state.hideOverlay})}></div>
      			<div className={classnames('main-intro', { onHide: this.state.showVideo, onMoveTop: this.state.isSmallIntro})}>
      				<p className='main-title'>Jessica's vlog</p>
      				{!this.state.isSmallIntro && <p><a href='#' onClick={() => {this.playVideo()}}>play</a></p>}
      				<p className='main-sub'>Make up, lookbook, and travel</p>
      			</div>
				<div className={classnames('video-background', { showVideo: this.state.showVideo, noBlur: this.state.hideOverlay})}>
				    <div className="video-foreground">
				    	<div id='youtube-player'></div>
				    </div>
				</div>

				<div className={classnames('video-library', { onHide: this.state.hideVideos})}>
					<div className='scrolls'>
						{this.props.jChannelList.map((video) => {
							let divStyle = {
						      backgroundImage: 'url(' + video.snippet.thumbnails.medium.url + ')'
						    };
							return (
								<div
									style={divStyle} 
									className='videoCard' 
									key={video.id}>
									<div className='videoCard-desc'>
										{video.snippet.title}
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
					<a href='#' onClick={() => {this.playVideo()}}>play</a>
					<p>
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
