import React, {Component} from 'react';
import PropTypes from 'prop-types';
import 'styles/Carousel.css';
import 'styles/ProgramItem.css';
import LockIcon from "resources/icons/white-lock-icon.png";
import { getProgramTitle, getProgramCover, getProgramCategory, FORMAT_16_9 } from 'components/utils/StripUtils';
import { getCarouselItemMargin } from 'components/utils/CarouselUtils';
import { addToPath } from 'components/utils/NavigationUtils';
import { SELECT_KEY, IS_STB_DEVICE, SERVICE_TVOD } from 'constants/ApplicationConstants';
import { VOD_SEASON_PAGE_ROUTE, REPLAY_SEASON_PAGE_ROUTE } from "constants/ApplicationRoutes";
import {FormattedMessage} from 'react-intl';

const IMAGE_WIDTH = 272;
const MINIMUM_MARGIN = 24;

export default class ProgramsStrip extends Component {

    static propTypes = {
        programs: PropTypes.array.isRequired,
        channel: PropTypes.object,
        destinationPage: PropTypes.object.isRequired,
        sourcePage: PropTypes.string.isRequired,
        moreTo: PropTypes.object.isRequired,
        label: PropTypes.string,
        sectionClassName: PropTypes.string,
        upSection: PropTypes.string,
        downSection: PropTypes.string
    };

    constructor(props) {
        super(props);

        let screenWidth = window.document.body.scrollWidth - this.props.carouselMargin * 2;
        let floorImages = Math.floor(screenWidth / (IMAGE_WIDTH + MINIMUM_MARGIN));

        this.itemMargin = (screenWidth - (floorImages * IMAGE_WIDTH)) / ((floorImages + 1) * 2);
        this.carouselItems = [];
        this.getItemMargin = getCarouselItemMargin.bind(this);
    };

    componentDidMount() {
        IS_STB_DEVICE && this.carouselItems.forEach((carouselItem, i) => {
            let item = (i === this.carouselItems.length - 1) ? this.props.programs : carouselItem.program;
            carouselItem.elem.addEventListener("sn:enter-up", this.openItem.bind({ carousel: this, item: item }));
        });
    };

    componentWillUnmount() {
        IS_STB_DEVICE && this.carouselItems.forEach((carouselItem) => {
            carouselItem.elem && carouselItem.elem.removeEventListener("sn:enter-up", this.openItem.bind({ carousel: this, item: carouselItem.program }));
        });
    };

    openItem(event, item) {
        let selectedItem = IS_STB_DEVICE ? this.item : item;
        let carousel = IS_STB_DEVICE ? this.carousel : this;

        if((IS_STB_DEVICE || (event && event.keyCode === SELECT_KEY)) && selectedItem && !selectedItem.isFailed) {
            if (selectedItem.id) {
                if (carousel.props.sourcePage === VOD_SEASON_PAGE_ROUTE || carousel.props.sourcePage === REPLAY_SEASON_PAGE_ROUTE) {
                    addToPath(`${carousel.props.sourcePage}/${selectedItem.seasonInfo.id}`);
                } else {
                    addToPath(carousel.props.sourcePage);
                }
                carousel.props.router.push(`${carousel.props.destinationPage[selectedItem.type]}/${selectedItem.id}`);
            } else{
                addToPath(carousel.props.sourcePage);
                carousel.props.router.push(`${carousel.props.moreTo.destinationPage}/${selectedItem[0].catalogId}`);
            }
        }
    };

    createCarouselContent() {
        const { programs, elementsIdPrefix, moreTo, isBackgroundBlack, channel, sectionClassName, upSection, downSection } = this.props;

        let labelTextColor = isBackgroundBlack ? "white-color" : "";
        let circleColor = isBackgroundBlack ? "circle-white" : "circle";
        let carouselLength = programs.length;

        let customSnUpSection = upSection ? '@' + upSection : null;
        let customSnDownSection = downSection ? '@' + downSection : null;
        let sectionClass = sectionClassName ? sectionClassName : "first-section-focusable";

        let content = programs.map((program, i) => {
            let category = getProgramCategory(program.kinds);

            return (
                <div className="program-item-container" style={this.getItemMargin(i)} key={i}>
                    <div ref={elem => this.carouselItems[i] = { elem, program }} onKeyUp={(e) => this.openItem(e, program)} id={elementsIdPrefix + i}
                         className={"program-poster-container gray-background display-block " + sectionClass + "  background-image-cover"} listindex={i}
                         style={{backgroundImage: 'url("' +  getProgramCover(program, FORMAT_16_9) + '")'}} data-sn-up={customSnUpSection} data-sn-down={customSnDownSection}>
                        { programs[0].serviceId !== SERVICE_TVOD && channel && !channel.subscribed && <div className="unsubscribed-transparent-layer"><img src={LockIcon} className="lock-icon" alt=""/></div> }
                    </div>

                    <div className="program-details-container">
                        <label className={"overflow-text two-lines-text bold-text size-24 "+labelTextColor}>{getProgramTitle(program)}</label>
                        {category && <label className={"program-genre bold-text size-20 " + labelTextColor}>{category}</label>}
                    </div>
                </div>
            );
        });

        if(moreTo.destinationPage) {
            let catalogId = programs[0].catalogId;

            content.push(
                <div className="program-item-container" style={this.getItemMargin(programs.length)} key={carouselLength} >
                    <div ref={elem => this.carouselItems[carouselLength] = { elem, catalogId }} onKeyUp={(e) => this.openItem(e, programs)} id={elementsIdPrefix + "more"} className="program-poster-container first-section-focusable other-programs-image" listindex={carouselLength}>
                        <div className="circles-container center-container flex-space-between">
                            <div className={circleColor}/>
                            <div className={circleColor}/>
                            <div className={circleColor}/>
                        </div>
                    </div>

                    <div className="program-details-container">
                        <label className={"overflow-text two-lines-text bold-text size-24 " + labelTextColor}>
                            <FormattedMessage id={'programsStrip.moreChannels'} defaultMessage={'More channels'}/>
                        </label>
                    </div>
                </div>
            );
        }

        return content;
    }

    render(){

        return(
            this.createCarouselContent()
        );
    }
}

