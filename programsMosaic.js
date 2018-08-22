import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { makeSectionFocusable, MOSAIC_NAVIGATION_SECTION } from 'navigation';
import { IS_STB_DEVICE, SELECT_KEY } from "constants/ApplicationConstants";
import LockIcon from "resources/icons/lock-icon.png";
import playIcon from 'resources/images/play-big.png';
import 'styles/ProgramsMosaic.css';
import 'styles/ProgramItem.css';
import { getChannelCover, getProgramTitle, getProgramCover, FORMAT_16_9 } from 'components/utils/StripUtils';
import { addToPath } from 'components/utils/NavigationUtils';

export default class ProgramsMosaic extends Component {

    static propTypes = {
        programs: PropTypes.array.isRequired,
        channels: PropTypes.array,
        label: PropTypes.string,
        subscribed: PropTypes.bool,
        destinationPage: PropTypes.object.isRequired,
        sourcePage: PropTypes.string.isRequired,
        type: PropTypes.string
    };

    constructor(props) {
        super(props);
        this.mosaicItems = [];
    };

    componentDidMount() {
        makeSectionFocusable(MOSAIC_NAVIGATION_SECTION);
    };

    componentDidUpdate() {
        IS_STB_DEVICE && this.mosaicItems.forEach((mosaicItem) => {
            if(mosaicItem.program && mosaicItem.program.id){
                (this.props.type === "tv-program") && mosaicItem.elem.addEventListener("sn:enter-up", this.openTVItem.bind({ mosaic: this, item: mosaicItem }));
                (this.props.type === "replay-program") && mosaicItem.elem.addEventListener("sn:enter-up", this.openReplayItem.bind({ mosaic: this, item: mosaicItem }));

            }
        });
        makeSectionFocusable(MOSAIC_NAVIGATION_SECTION);
    };

    componentWillUnmount() {
        IS_STB_DEVICE && this.mosaicItems.forEach((mosaicItem) => {
            (this.props.type === "tv-program") && mosaicItem.elem && mosaicItem.elem.removeEventListener("sn:enter-up", this.openTVItem.bind({ mosaic: this, item: mosaicItem }));
            (this.props.type === "replay-program") && mosaicItem.elem && mosaicItem.elem.removeEventListener("sn:enter-up", this.openReplayItem.bind({ mosaic: this, item: mosaicItem }));
        });
    };

    openTVItem(event, item, i) {
        let selectedItem = IS_STB_DEVICE ? this.item.program : item;
        let index = IS_STB_DEVICE ? this.item.i : i;
        let mosaic = IS_STB_DEVICE ? this.mosaic : this;
        if(IS_STB_DEVICE || (event && event.keyCode === SELECT_KEY)) {
            if(selectedItem.isLive) {
                let livePath = {
                    pathname: mosaic.props.destinationPage,
                    state: {
                        channels: mosaic.props.channels,
                        sourcePage: mosaic.props.sourcePage,
                        programs: mosaic.props.programs,
                        channelIndex: index
                    }
                };
                mosaic.props.router.push(livePath);
            } else if(!selectedItem.isFailed) {
                // Tonight item
                addToPath(mosaic.props.sourcePage);
                mosaic.props.router.push(`${mosaic.props.destinationPage}/${selectedItem.channelId}/${selectedItem.id}`);
            }
        }
    };

    createTVContent(programs) {
        let { channels } = this.props;

        return programs.map((program, i) => (
            <div id={"programs-mosaic-"+i} className="program-item-container" key={i}>
                <div ref={elem => this.mosaicItems[i] = { elem, program, i }} onKeyUp={(e) => this.openTVItem(e, program, i)} className={"program-poster-container mosaic-focusable display-block mosaic-item-" + i+" background-image-cover"}
                     style={{backgroundImage: 'url("' +  getProgramCover(program, FORMAT_16_9) + '")'}} data-sn-right={".mosaic-item-" + (i+1)} data-sn-left={".mosaic-item-" + (i-1)} >
                    { program.liveProgress && <img className="cover-image play-icon center-container" src={playIcon} alt=""/> }
                </div>
                { program.liveProgress && <div className="progress-bar-container"><div className="progress-bar" style={{width: program.liveProgress+'%'}}></div></div> }

                <div className="program-details-container flex-space-between">
                    <div className="program-details">
                        <label className="overflow-text two-lines-text bold-text size-24">{getProgramTitle(program)}</label>
                        { program.kindDetailed && <label className="program-genre bold-text size-20">{program.kindDetailed}</label> }
                    </div>
                    <div className="program-channel-logo-container center-image" style={{backgroundSize: "70px", backgroundImage: 'url("' +  getChannelCover(channels[i]) + '")'}}/>
                </div>
            </div>
        ));
    };

    openReplayItem(event, item) {
        let selectedItem = IS_STB_DEVICE ? this.item.program : item;
        let isSelectKeyPressed = event ? event.keyCode === SELECT_KEY : false;
        let mosaic = IS_STB_DEVICE ? this.mosaic : this;
        if((IS_STB_DEVICE || (event && event.keyCode === SELECT_KEY)) && !isSelectKeyPressed.isFailed) {
            addToPath(`${mosaic.props.sourcePage}/${selectedItem.catalogId}`);
            mosaic.props.router.push(`${mosaic.props.destinationPage[selectedItem.type]}/${selectedItem.id}`);
        }
    };

    createReplayContent(programs) {
        let { subscribed } = this.props;

        return programs.map((program, i) => (
            <div id={"programs-mosaic-"+i} className="program-item-container" key={i}>
                <div ref={elem => this.mosaicItems[i] = { elem, program, i }} onKeyUp={(e) => this.openReplayItem(e, program)} className={"program-poster-container mosaic-focusable display-block mosaic-item-" + i +" background-image-cover"}
                        data-sn-right={".mosaic-item-" + (i+1)} style={{backgroundImage: 'url("' +  getProgramCover(program, FORMAT_16_9) + '")'}} data-sn-left={".mosaic-item-" + (i-1)} >
                    { subscribed === false &&  <div className="unsubscribed-transparent-layer"><img src={LockIcon} className="lock-icon" alt=""/></div> }
                </div>

                <div className="program-details-container">
                    <label className="overflow-text two-lines-text bold-text size-24">{getProgramTitle(program)}</label>
                </div>
            </div>
        ));
    };

    render() {
        let { programs, label, type } = this.props;

        return (
            <div className="programs-mosaic-page">
                { label && <div className="programs-mosaic-label-container"><label className="bold-text size-40">{label}</label></div> }

                { programs.length === 0 && <div className="programs-mosaic-label-container mosaic-focusable"><label className="bold-text size-40">No results</label></div> }

                { programs.length > 0 &&
                    <div className="programs-mosaic-container">
                        { type === "tv-program" && this.createTVContent(programs) }
                        { type === "replay-program" && this.createReplayContent(programs) }
                    </div>
                }

            </div>
        );
    }
}