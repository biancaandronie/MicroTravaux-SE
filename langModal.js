import React, { Component } from 'react';
import { connect } from 'react-redux';
import { makeSectionFocusable, NAVIGATION_MODAL_SECTION } from 'navigation';
import { ENGLISH_LANGUAGE, FRENCH_LANGUAGE, ROMANIAN_LANGUAGE, POLISH_LANGUAGE, IS_STB_DEVICE } from 'constants/ApplicationConstants';
import { SELECT_KEY } from 'constants/ApplicationConstants';
import { changeLanguageAction } from 'redux/actions/modalActions';
import 'styles/MySettings.css';
import 'styles/Modal.css';

import { FormattedMessage } from 'react-intl';

class LanguageModal extends Component {

    constructor(props) {
        super(props);

        this.state = {
            selectedOption: null
        }
        this.languages = [];
    };

    componentWillMount() {
        let languageInfo = this.props.languageInfo;

        let selectedLanguage = languageInfo.language ? languageInfo.language : ENGLISH_LANGUAGE;
        this.setState({selectedOption: selectedLanguage});
    };

    componentDidMount() {
        IS_STB_DEVICE && this.languages.forEach((option) => {
            option.elem.addEventListener("sn:enter-up", this.toggleSelected.bind({ modal: this, language: option.language }));
        });
        makeSectionFocusable(NAVIGATION_MODAL_SECTION);
    };

    componentWillUnmount(){
        IS_STB_DEVICE && this.languages.forEach((option) => {
            option.elem.removeEventListener("sn:enter-up", this.toggleSelected.bind({ modal: this, language: option.language }));
        });
    }

    toggleSelected(event, language) {
        let selectedLanguage = IS_STB_DEVICE ? this.language : language;
        let modal = IS_STB_DEVICE ? this.modal : this;
        if((IS_STB_DEVICE || (event && event.keyCode === SELECT_KEY)) && selectedLanguage !== modal.state.selectedOption) {
            modal.setState({ ...modal.state, selectedOption: selectedLanguage });

            setTimeout(() => {
                modal.props.changeLanguageAction(selectedLanguage);
                modal.props.onClose();
            }, 200);
        }
    };

    renderLanguages() {
        let englishClassName = this.state.selectedOption === ENGLISH_LANGUAGE ? " modal-section-default" : "";
        let frenchClassName = this.state.selectedOption === FRENCH_LANGUAGE ? " modal-section-default" : "";
        let romanianClassName = this.state.selectedOption === ROMANIAN_LANGUAGE ? " modal-section-default" : "";
        let polishClassName = this.state.selectedOption === POLISH_LANGUAGE ? " modal-section-default" : "";

        let languages = [ENGLISH_LANGUAGE, FRENCH_LANGUAGE, ROMANIAN_LANGUAGE, POLISH_LANGUAGE];
        let languageClassName = [englishClassName, frenchClassName, romanianClassName, polishClassName];
        let languageLabel = ['languageModal.english', 'languageModal.french', 'languageModal.romanian', 'languageModal.polish'];

        return languages.map((language, i) => (
            <div className={"option-container modal-section-focusable" + languageClassName[i]} key={i} ref={elem => this.languages[i] = {elem, language}} onKeyDown={(event) => this.toggleSelected(event, language)}>
                <div className="modal-radio-button">
                    { this.state.selectedOption === language && <div className="modal-radio-button-selected"></div> }
                </div>
                <label className="size-24 bold-text"><FormattedMessage id={languageLabel[i]}/></label>
            </div>
        ));
    };

    render() {
        return (
            <div>
                <label className="language-modal-title size-30 bold-text">
                    <FormattedMessage id={'languageModal.language'} defaultMessage={'Language:'}/>
                </label>

                { this.renderLanguages() }
            </div>
        );
    }
}

const mapStateToProps = (state) => {
    return {
        languageInfo: state.languageInfo
    }
};

const mapDispatchToProps = (dispatch) => {
    return {
        changeLanguageAction: (language) => {
            dispatch(changeLanguageAction(language));
        }
    }
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(LanguageModal);