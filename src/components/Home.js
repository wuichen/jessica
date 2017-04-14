import React from "react";
import { connect } from "react-redux";
import $ from 'jquery';
import classnames from 'classnames';

// yt-player by feross not compiling to es5, thus extracting the code out and manually inserted into the code base
import YTPlayer from '../yt-player';
import Linkify from 'react-linkify';

// Home page component
export class Home extends React.Component {

	constructor(props)  {
	    super(props);
	    this.state = {
	    	hideVideos: true,
	    	hideOverlay: false,
	    	showVideo: false,
	    	player: null,
	    	scrollingDetails: false
	   	};
	}

	componentDidMount() {
		this.props.dispatch({type: 'FETCH_JESSICA_CHANNEL_LIST'});
		let thisComponent = this;

		$(window).on('scroll', function() {
		    var scrollTop = $(this).scrollTop();

		    if (scrollTop > 10) {
		    	thisComponent.setState({
		    		hideVideos: false,
		    		hideOverlay: false,
		    		showVideo: false
		    	})
		    } else {
		    	thisComponent.setState({
		    		hideVideos: true
		    	})
		    	
		    }
		});

		setInterval(() => {
			$('.fa-play-circle-o').toggleClass('jump')
		}, 500)
		setInterval(() => {
			$('.scrollBox').toggleClass('blink')
		}, 500)

		setInterval(() => {
			$('.scrollUp').toggleClass('blink')
		}, 500)

		$(document).keyup(function(e){
		    if (e.keyCode === 27) {
		    	thisComponent.state.player.pause();
		    }     
		});
	}

	componentWillReceiveProps(nextProps) {
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

		if (this.state.player) {
  			let thisComponent = this;
			this.state.player.on('paused', () => {
				setTimeout(function() {
				  	if (thisComponent.state.player.getState() === 'paused') {
				  		thisComponent.setState({
							hideOverlay: false,
							showVideo: false,
							hideVideos: false
						})
						window.scroll(0,150) 
				  	}
				}, 500)
			})
		}
	}

	playVideo() {
		this.state.player.play();
		let thisComponent = this;
		this.setState({
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
		this.props.dispatch({
			type: 'SELECT_VIDEO',
			video: video
		})
	}

	loadMore() {
		if (this.props.nextPageToken) {
			this.props.dispatch({
				type: 'LOAD_MORE_FROM_CHANNEL_LIST',
				nextPageToken: this.props.nextPageToken
			})
		} 
	}

	swipeRight(){
	    $('.scrolls').animate({scrollLeft:'+=300'},500);
	}

	swipeLeft(){
	    $('.scrolls').animate({scrollLeft:'-=300'},500);
	}

	disableBodyScroll() {
		$('body').css('overflow-y','hidden');
		this.setState({
			scrollingDetails: true
		})
	}

	enableBodyScroll() {
		$('body').css('overflow-y','auto');
		let thisComponent = this;
		setTimeout(() => {
			thisComponent.setState({
				scrollingDetails: false
			})
		},1000)
	}

	scrollDown() {
		$('html, body').animate({
		    scrollTop: 100
		}, 1000);
	}

	scrollUp() {
		$('html, body').animate({
		    scrollTop: 0
		}, 1000);
	}

  	// render
  	render() {
		let dateString;
		if (this.props.selectedVideo) {
			let date = new Date(this.props.selectedVideo.snippet.publishedAt);
			dateString = 'Published At: ' + date.getUTCFullYear() + '.' + date.getUTCMonth() + '.' + date.getUTCDate()
		}

	    return (
	      	<div className="page-home">
	      		<div className={classnames('overlay', { onHide: this.state.hideOverlay})}></div>
      			<div className={classnames('main-intro', { onHide: this.state.showVideo, onMoveTop: (!this.state.hideVideos && this.props.jChannelList.length)})}>
      				<p className='main-title'>Jessica lin Channel</p>
      				<p className='main-sub'>
      					Make up, lookbook, and travel
      					{/*!this.state.hideVideos && (
      						<a className='scrollUp' onClick={()=> {this.scrollUp()}}>
      							<br />
			      				<i className="fa fa-angle-double-up" aria-hidden="true"></i><br />
			      					Home
      						</a>
      					)*/}
      				</p>
      				{this.state.hideVideos && (
      					<div>
      						{/*
	      					<div className='playBox'>
	      						<a href='#' onClick={() => {this.playVideo()}}>
	      							<i className="fa fa-play-circle-o" aria-hidden="true"></i>
								</a>
							</div>
							*/}
							<div className='social-icons'>
								<a href='http://weibo.com/u/5998160280?is_all=1'><img src='/media/weibo.png' alt='weibo' /></a>
								<a href='https://www.instagram.com/jessicalinchannel/'><img src='/media/instagram.png' alt='instagram' /></a>
								<a href='http://www.meipai.com/user/1097096832'><img src='/media/meipai.png' alt='meipai' /></a>
								<a href='http://space.bilibili.com/44334605/#!/index'><img src='/media/bili.png' alt='bili' /></a>
								<a href='https://www.youtube.com/channel/UCkmdNARD7bwvj2xlMotWoyg/about'><img src='/media/youtube.png' alt='youtube' /></a>
							</div>
							<div className='scrollBox'>
								<a href='#' onClick={() => {this.scrollDown()}}>
									<i className="fa fa-angle-double-down" aria-hidden="true"></i>
									<br />
									Scroll
								</a>
							</div>
						</div>
      				)}
  					
      			</div>
				<div className={classnames('video-background', { showVideo: this.state.showVideo, noBlur: this.state.hideOverlay})}>
				    <div className="video-foreground">
				    	<div id='youtube-player'></div>
				    </div>
				</div>
				{this.props.jChannelList && (
					<div>
						<div className={classnames('video-library', { onHide: this.state.hideVideos})}>
							<a className='carets left-caret' onClick={() => {this.swipeLeft();}}><i className="fa fa-caret-left" aria-hidden="true"></i></a>
							<a className='carets right-caret' onClick={() => {this.swipeRight();}}><i className="fa fa-caret-right" aria-hidden="true"></i></a>
							<div className='scrolls'>
								{this.props.jChannelList && this.props.jChannelList.map((video) => {
									let date = new Date(video.snippet.publishedAt);
									let dateString = date.getUTCFullYear() + '.' + date.getUTCMonth() + '.' + date.getUTCDate()
									let divStyle = {
								      backgroundImage: 'url(' + video.snippet.thumbnails.medium.url + ')'
								    };
								    let selected = (video.id === this.props.selectedVideo.id)
									return (
										<div
											style={divStyle} 
											className={classnames('videoCard', {selected: selected})}
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
								{this.props.nextPageToken && (
									<div className='loadMoreCard' onClick={() => {this.loadMore()}}>
										<div className='videoCard-desc'>
											<p>Load More</p>
											<i className="fa fa-ellipsis-h" aria-hidden="true"></i>
										</div>
									</div>
								)}

							</div>
						</div>

						<div onMouseOver={() => {this.disableBodyScroll()}} onMouseLeave={() => {this.enableBodyScroll()}} className={classnames('video-details', { onHide: this.state.hideVideos})}>
							<div className='scroll'>
								{($(document).width() <= 570) && (
									<div className='playBox text-center'>
										<a href='#' onClick={() => {this.playVideo()}}>
				      						<i className="fa fa-play-circle-o" aria-hidden="true"></i>
										</a>
									</div>
								)}
								<h2>
									{this.props.selectedVideo && this.props.selectedVideo.snippet.title}
								</h2>
								{($(document).width() > 570) && (
									<div className='playBox'>
										<a href='#' onClick={() => {this.playVideo()}}>
				      						<i className="fa fa-play-circle-o" aria-hidden="true"></i>
										</a>
									</div>
								)}
								{dateString && (
									<p>
										<strong>
											{dateString}
											<br />
										</strong>
									</p>
								)}
								<p>
									{this.props.selectedVideo && 
										<Linkify>{this.props.selectedVideo.snippet.description}</Linkify>
									}
								</p>
							</div>
						</div>
					</div>
				)}
	      	</div>
	    );
  }
}
function mapStateToProps(state) {
  	return {
  		jChannelList: state.videos.jChannelList,
  		selectedVideo: state.videos.selectedVideo,
  		nextPageToken: state.videos.nextPageToken
  	};
}
export default connect(mapStateToProps)(Home);
