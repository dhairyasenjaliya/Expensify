import PropTypes from 'prop-types';
import React from 'react';
import SkeletonViewContentLoader from 'react-content-loader/native';
import {View} from 'react-native';
import {Rect} from 'react-native-svg';
import compose from '../libs/compose';
import styles from '../styles/styles';
import themeColors from '../styles/themes/default';
import withLocalize from './withLocalize';
import withWindowDimensions from './withWindowDimensions';

const propTypes = {
    /** Whether to animate the skeleton view */
    shouldAnimate: PropTypes.bool,
};

const defaultTypes = {
    shouldAnimate: true,
};

function ArchivedReportFooterSkeletonView(props) {
    return (
        <View style={[styles.flexRow, styles.alignItemsCenter, styles.p5, styles.archivedReportFooter, styles.hoveredComponentBG]}>
            <SkeletonViewContentLoader
                animate={props.shouldAnimate}
                width={styles.w100.width}
                height={8}
                backgroundColor={themeColors.borderLighter}
                foregroundColor={themeColors.border}
            >
                <Rect
                    x="0"
                    y="0"
                    width="100%"
                    height="8"
                />
            </SkeletonViewContentLoader>
        </View>
    );
}

ArchivedReportFooterSkeletonView.propTypes = propTypes;
ArchivedReportFooterSkeletonView.defaultProps = defaultTypes;

ArchivedReportFooterSkeletonView.displayName = 'ArchivedReportFooterSkeletonView';
export default compose(withWindowDimensions, withLocalize)(ArchivedReportFooterSkeletonView);
