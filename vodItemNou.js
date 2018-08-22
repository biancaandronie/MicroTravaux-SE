import React, { Component } from 'react';
import PropTypes from 'prop-types';
import 'styles/VideoItem.css';
import LockIcon from "resources/icons/white-lock-icon.png";
import { SERVICE_SVOD, IS_STB_DEVICE, SELECT_KEY } from "constants/ApplicationConstants";
import { VOD_SERIES_PAGE_ROUTE, VOD_SEASON_PAGE_ROUTE, VOD_CATALOG_PAGE_ROUTE } from "constants/ApplicationRoutes";
import { getProgramTitle, getProgramCover, FORMAT_3_4, convertTimestampToDate } from 'components/utils/StripUtils';
import { addToPath } from 'components/utils/NavigationUtils';

import { FormattedMessage, injectIntl } from 'react-intl';

export class VodItem extends Component{

    static propTypes = {
        video: PropTypes.object,
        channel: PropTypes.object,
        index: PropTypes.number,
        destinationPage: PropTypes.object,
        sourcePage: PropTypes.string.isRequired,
        elementsIdPrefix: PropTypes.string.isRequired,
        moreTo: PropTypes.object,
        navClass: PropTypes.string.isRequired,
        marginStyle: PropTypes.object,
        snUp: PropTypes.string,
        snDown: PropTypes.string,
        isBackgroundBlack: PropTypes.bool,
        defaultElementClassName: PropTypes.string,
        isMosaic: PropTypes.bool
    };

    constructor(props) {
        super(props);

        this.currentItem = null;
    };

    componentDidMount() {
        IS_STB_DEVICE && this.currentItem.elem.addEventListener("sn:enter-up", this.openItem.bind({ item: this, video: this.currentItem.video }));
    };

    componentWillUnmount() {
        IS_STB_DEVICE && this.currentItem.elem && this.currentItem.elem.removeEventListener("sn:enter-up", this.openItem.bind({ item: this, video: this.currentItem.video }));
    };

    openItem(event, video) {
        let selectedVideo = IS_STB_DEVICE ? this.video : video;
        let item = IS_STB_DEVICE ? this.currentItem : this;

        if ((IS_STB_DEVICE || (event && event.keyCode === SELECT_KEY))) {
            if (selectedVideo && !selectedVideo.isFailed) {
                if (item.props.sourcePage === VOD_SERIES_PAGE_ROUTE) {
                    addToPath(`${item.props.sourcePage}/${selectedVideo.seriesInfo.id}`);
                } else if (item.props.sourcePage === VOD_CATALOG_PAGE_ROUTE) {
                    addToPath(`${item.props.sourcePage}/${selectedVideo.serviceId}/${selectedVideo.catalogId}?label=${item.props.label}`);
                } else if (item.props.sourcePage !== VOD_SEASON_PAGE_ROUTE) {
                    addToPath(item.props.sourcePage);
                }
                item.props.router.push(`${item.props.destinationPage[selectedVideo.type]}/${selectedVideo.id}`);
            } else if(item.props.moreTo.destinationPage){
                addToPath(item.props.sourcePage);
                if (item.props.moreTo.rentedStrip) {
                    item.props.router.push(`${item.props.moreTo.destinationPage}`);
                } else {
                    item.props.router.push(`${item.props.moreTo.destinationPage}/${this.props.serviceId}/${this.props.catalogId}?label=${item.props.label}`);
                }
            }
        }
    }

    getElementSectionClassName(index) {
        return index === 0 ? this.props.navClass + " " + this.props.defaultElementClassName : this.props.navClass;
    }

    createCarouselContent() {
        const { formatMessage } = this.props.intl;
        let { isMosaic, video, index, elementsIdPrefix, channel, snDown, snUp, marginStyle, isBackgroundBlack } = this.props;

        let baseElementStyle = " video-poster-container display-block background-image-cover ";
        let chainStyle = "vod-item-";

        let itemStyle = this.getElementSectionClassName(index) + baseElementStyle + chainStyle + index;

        let snRight = isMosaic ? "." + chainStyle + (index+1) : null;
        let snLeft = isMosaic && index > 0 ? "." + chainStyle + (index-1) : null;

        let labelTextColor = isBackgroundBlack ? "white-color" : "";

        if(video) {
            return (
                <div className="video-item-container" style={marginStyle} >
                    <div ref={elem => this.currentItem = { elem, video }} onKeyUp={(e) => this.openItem(e, video)} id={elementsIdPrefix + index} listindex={index} className={itemStyle}
                        style={{backgroundImage: 'url("' +  getProgramCover(video, FORMAT_3_4) + '")'}} data-sn-right={snRight} data-sn-left={snLeft} data-sn-up={snUp} data-sn-down={snDown}>
                        { video.serviceId === SERVICE_SVOD && channel && !channel.subscribed && <div className="unsubscribed-transparent-layer"><img src={LockIcon} className="lock-icon" alt=""/></div> }
                    </div>

                    <div className="program-details-container">
                        <label className={"two-lines-text overflow-text bold-text size-24 " + labelTextColor}>{getProgramTitle(video)}</label>
                        { video.kinds && video.kinds.length > 0 && <label className={"program-genre bold-text size-20 " + labelTextColor}>{video.kinds[video.kinds.length - 1]}</label> }
                    </div>

                    { video.isRented && isMosaic &&
                        <label className="bold-text size-10 orange-color label-margin">
                            <FormattedMessage id={'articlePage.shortExpiration'} values={{ date: convertTimestampToDate(video.definitions[0].commercializations[0].endDate, false, formatMessage) }}/>
                        </label>
                    }
                </div>
            )
        } else {
            let circleColor = isBackgroundBlack ? "circle-white" : "circle";

            return (
                <div className="video-item-container">
                    <div ref={elem => this.currentItem = {elem}} onKeyUp={(e) => this.openItem(e)} id={elementsIdPrefix + "more"} className={itemStyle} listindex={index}>
                        <div className="circles-container center-container flex-space-between">
                            <div className={circleColor}/>
                            <div className={circleColor}/>
                            <div className={circleColor}/>
                        </div>
                    </div>

                    <div className="program-details-container">
                        <label className={"title-overflow bold-text size-24 "+ labelTextColor}>
                            <FormattedMessage id={'videoStrip.moreChannels'} defaultMessage={'More videos'}/>
                        </label>
                    </div>
                </div>
            )
        }
    }

    render(){
        return(
            this.createCarouselContent()
        );
    }

}

export default injectIntl(VodItem)