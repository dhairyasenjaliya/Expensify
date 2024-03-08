import {fireEvent, screen} from '@testing-library/react-native';
import type {ComponentType} from 'react';
import Onyx from 'react-native-onyx';
import {measurePerformance} from 'reassure';
import type {WithNavigationFocusProps} from '@components/withNavigationFocus';
import type Navigation from '@libs/Navigation/Navigation';
import ComposeProviders from '@src/components/ComposeProviders';
import {LocaleContextProvider} from '@src/components/LocaleContextProvider';
import OnyxProvider from '@src/components/OnyxProvider';
import {WindowDimensionsProvider} from '@src/components/withWindowDimensions';
import * as Localize from '@src/libs/Localize';
import ONYXKEYS from '@src/ONYXKEYS';
import ReportActionsList from '@src/pages/home/report/ReportActionsList';
import {ReportAttachmentsProvider} from '@src/pages/home/report/ReportAttachmentsContext';
import {ActionListContext, ReactionListContext} from '@src/pages/home/ReportScreenContext';
import variables from '@src/styles/variables';
import * as LHNTestUtils from '../utils/LHNTestUtils';
import PusherHelper from '../utils/PusherHelper';
import * as ReportTestUtils from '../utils/ReportTestUtils';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';
import wrapOnyxWithWaitForBatchedUpdates from '../utils/wrapOnyxWithWaitForBatchedUpdates';

const mockedNavigate = jest.fn();

jest.mock('@src/components/withNavigationFocus', <TProps extends WithNavigationFocusProps>() => (Component: ComponentType<TProps>) => {
    function WithNavigationFocus(props: Omit<TProps, keyof WithNavigationFocusProps>) {
        return (
            <Component
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...(props as TProps)}
                isFocused={false}
            />
        );
    }

    WithNavigationFocus.displayName = 'WithNavigationFocus';

    return WithNavigationFocus;
});

jest.mock('@react-navigation/native', () => {
    const actualNav = jest.requireActual('@react-navigation/native');
    return {
        ...actualNav,
        useRoute: () => mockedNavigate,
        useIsFocused: () => true,
    } as typeof Navigation;
});

jest.mock('@src/components/ConfirmedRoute.tsx');

beforeAll(() =>
    Onyx.init({
        keys: ONYXKEYS,
        safeEvictionKeys: [ONYXKEYS.COLLECTION.REPORT_ACTIONS],
    }),
);

afterAll(() => {
    jest.clearAllMocks();
});

const mockOnLayout = jest.fn();
const mockOnScroll = jest.fn();
const mockLoadChats = jest.fn();
const mockRef = {current: null, flatListRef: null, scrollPosition: null, setScrollPosition: () => {}};

// Initialize the network key for OfflineWithFeedback
beforeEach(() => {
    PusherHelper.setup();
    wrapOnyxWithWaitForBatchedUpdates(Onyx);
    return Onyx.merge(ONYXKEYS.NETWORK, {isOffline: false});
});

// Clear out Onyx after each test so that each test starts with a clean slate
afterEach(() => {
    Onyx.clear();
    PusherHelper.teardown();
});

const currentUserAccountID = 5;

function ReportActionsListWrapper() {
    return (
        <ComposeProviders components={[OnyxProvider, LocaleContextProvider, WindowDimensionsProvider, ReportAttachmentsProvider]}>
            <ReactionListContext.Provider value={mockRef}>
                <ActionListContext.Provider value={mockRef}>
                    <ReportActionsList
                        sortedReportActions={ReportTestUtils.getMockedSortedReportActions(500)}
                        report={LHNTestUtils.getFakeReport()}
                        onLayout={mockOnLayout}
                        onScroll={mockOnScroll}
                        loadMoreChats={mockLoadChats}
                        loadOlderChats={mockLoadChats}
                        loadNewerChats={mockLoadChats}
                        currentUserPersonalDetails={LHNTestUtils.fakePersonalDetails[currentUserAccountID]}
                    />
                </ActionListContext.Provider>
            </ReactionListContext.Provider>
        </ComposeProviders>
    );
}

test('[ReportActionsList] should render ReportActionsList with 500 reportActions stored', () => {
    const scenario = async () => {
        await screen.findByTestId('report-actions-list');
        const hintText = Localize.translateLocal('accessibilityHints.chatMessage');
        // Ensure that the list of items is rendered
        await screen.findAllByLabelText(hintText);
    };

    return waitForBatchedUpdates()
        .then(() =>
            Onyx.multiSet({
                [ONYXKEYS.PERSONAL_DETAILS_LIST]: LHNTestUtils.fakePersonalDetails,
            }),
        )
        .then(() => measurePerformance(<ReportActionsListWrapper />, {scenario}));
});

test('[ReportActionsList] should scroll and click some of the reports', () => {
    const eventData = {
        nativeEvent: {
            contentOffset: {
                y: variables.optionRowHeight * 5,
            },
            contentSize: {
                // Dimensions of the scrollable content
                height: variables.optionRowHeight * 10,
                width: 100,
            },
            layoutMeasurement: {
                // Dimensions of the device
                height: variables.optionRowHeight * 5,
                width: 100,
            },
        },
    };

    const scenario = async () => {
        const reportActionsList = await screen.findByTestId('report-actions-list');
        fireEvent.scroll(reportActionsList, eventData);

        const hintText = Localize.translateLocal('accessibilityHints.chatMessage');
        const reportItems = await screen.findAllByLabelText(hintText);

        fireEvent.press(reportItems[0], 'onLongPress');
    };

    return waitForBatchedUpdates()
        .then(() =>
            Onyx.multiSet({
                [ONYXKEYS.PERSONAL_DETAILS_LIST]: LHNTestUtils.fakePersonalDetails,
            }),
        )
        .then(() => measurePerformance(<ReportActionsListWrapper />, {scenario}));
});
