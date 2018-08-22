import React, { Component } from 'react';
import PropTypes from 'prop-types';
import VodItem from 'components/items/VodItem';
import 'styles/VodMosaic.css';

export default class VodMosaic extends Component {

    static propTypes = {
        programs: PropTypes.array.isRequired,
        sourcePage: PropTypes.string.isRequired,
        destinationPage: PropTypes.object.isRequired,
        channel: PropTypes.object,
        label: PropTypes.string
    };

    render() {
        const { programs, label } = this.props;

        return (
            <div className="videos-mosaic-page">
                <div className="videos-mosaic-label-container">
                    <label className="bold-text size-40">{label}</label>
                </div>

                <div className="videos-mosaic-container">

                    { programs.map((video, i) => (
                        <VodItem
                            video={video}
                            index={i}
                            channel={this.props.channel}
                            sourcePage={this.props.sourcePage}
                            destinationPage={this.props.destinationPage}
                            navClass="mosaic-focusable"
                            isMosaic={true}
                            elementsIdPrefix="mosaic-item-"
                            router={this.props.router}
                            label={label}
                            key={i}
                        />
                    )) }

                </div>
            </div>
        );
    }
}