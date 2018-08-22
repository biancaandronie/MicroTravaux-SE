import React, { Component } from 'react';
import PropTypes from 'prop-types';
import 'styles/Carousel.css';
import { getCarouselItemMargin } from 'components/utils/CarouselUtils';
import VodItem from 'components/items/VodItem'

const IMAGE_WIDTH = 175;
const MINIMUM_MARGIN = 22;

export default class VodStrip extends Component{

    static propTypes = {
        programs: PropTypes.array.isRequired,
        channel: PropTypes.object,
        destinationPage: PropTypes.object.isRequired,
        sourcePage: PropTypes.string.isRequired,
        moreTo: PropTypes.object.isRequired,
        sectionClassName: PropTypes.string,
        upSection: PropTypes.string,
        downSection: PropTypes.string,
        label: PropTypes.string,
        defaultElementClassName: PropTypes.string
    };

    constructor(props) {
        super(props);

        let screenWidth = window.document.body.scrollWidth - this.props.carouselMargin*2;
        let floorImages = Math.floor(screenWidth / (IMAGE_WIDTH + MINIMUM_MARGIN));

        this.itemMargin = (screenWidth - (floorImages * IMAGE_WIDTH)) / ((floorImages + 1) * 2);
        this.getItemMargin = getCarouselItemMargin.bind(this);
    };

    createCarouselContent() {
        const { programs, sectionClassName, moreTo, upSection, downSection } = this.props;

        let carouselLength = programs.length;
        let snUp = upSection ? '@' + upSection : null;
        let snDown = downSection ? '@' + downSection : null;
        let navClass = sectionClassName ? sectionClassName : "first-section-focusable";

        let content = programs.map((video, i) => (
            <VodItem
                video={video}
                channel={this.props.channel}
                index={i}
                navClass={navClass}
                elementsIdPrefix={this.props.elementsIdPrefix}
                defaultElementClassName={this.props.defaultElementClassName}
                marginStyle={this.getItemMargin(i)}
                sourcePage={this.props.sourcePage}
                destinationPage={this.props.destinationPage}
                snUp={snUp}
                snDown={snDown}
                isBackgroundBlack={this.props.isBackgroundBlack}
                router={this.props.router}
                key={i}
            />
        ));

        if(moreTo.destinationPage) {
            content.push(
                <VodItem
                    moreTo={moreTo}
                    index={carouselLength}
                    navClass={navClass}
                    sourcePage={this.props.sourcePage}
                    elementsIdPrefix={this.props.elementsIdPrefix}
                    marginStyle={this.getItemMargin(carouselLength)}
                    snUp={snUp}
                    snDown={snDown}
                    isBackgroundBlack={this.props.isBackgroundBlack}
                    serviceId={programs[0].serviceId}
                    catalogId={programs[0].catalogId}
                    router={this.props.router}
                    label={this.props.label}
                    key={carouselLength}
                />
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
