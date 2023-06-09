import { lazy } from "react";
import { RouteObject } from "react-router-dom";
import { system, user, home } from "../api";
import {
  getToken,
  setFaceCheckKey,
  clearFaceCheckKey,
  setBindMobileKey,
  clearBindMobileKey,
} from "../utils/index";

// 页面加载
import { InitPage } from "../pages/init";
import LoginPage from "../pages/login";
import IndexPage from "../pages/index";
import VodPage from "../pages/vod/index";
import { VodDetailPage } from "../pages/vod/detail";
import { VodPlayPage } from "../pages/vod/video";
import { LivePage } from "../pages/live/index";
import { LiveDetailPage } from "../pages/live/detail";
import { LiveVideoPage } from "../pages/live/video";
import { AnnouncementPage } from "../pages/announcement/index";
import { ExamPage } from "../pages/exam/index";
import { ExamPaperPage } from "../pages/exam/paper/index";
import { ExamPaperDetailPage } from "../pages/exam/paper/detail";
import { ExamPaperPlayPage } from "../pages/exam/paper/play";
import { ExamMockPaperPage } from "../pages/exam/mock/index";
import { ExamMockPaperDetailPage } from "../pages/exam/mock/detail";
import { ExamMockPaperPlayPage } from "../pages/exam/mock/play";
import { ExamPracticePage } from "../pages/exam/practice/index";
import { ExamPracticeDetailPage } from "../pages/exam/practice/detail";
import { ExamPracticePlayPage } from "../pages/exam/practice/play";
import { ExamWrongbookPage } from "../pages/exam/wrongbook/index";
import { ExamWrongbookPlayPage } from "../pages/exam/wrongbook/play";
import { ExamCollectionPage } from "../pages/exam/collection/index";
import { ExamCollectionPlayPage } from "../pages/exam/collection/play";
import { MemberPage } from "../pages/member/index";
import { MemberMessagesPage } from "../pages/member/messages";
import { MemberOrdersPage } from "../pages/member/orders";
import { MemberPaperPage } from "../pages/member/paper";
import { MemberMockPaperPage } from "../pages/member/mock-paper";
import { MemberPracticePage } from "../pages/member/practice";
import { MemberQuestionsPage } from "../pages/member/questions";
import { MemberExchangerPage } from "../pages/member/codeexchanger";
import { MemberCredit1FreePage } from "../pages/member/credit1-free";
import { MemberCredit1RecordsPage } from "../pages/member/credit1-records";
import { MemberCertsPage } from "../pages/member/certs";
import { RolePage } from "../pages/role";
import { OrderPage } from "../pages/order/index";
import { OrderPayPage } from "../pages/order/pay";
import { OrderSuccessPage } from "../pages/order/success";
import { SearchPage } from "../pages/search";
import { TopicPage } from "../pages/topic/index";
import { TopicDetailPage } from "../pages/topic/detail";
import { BookPage } from "../pages/book/index";
import { BookDetailPage } from "../pages/book/detail";
import { BookReadPage } from "../pages/book/read";
import { LearnPathPage } from "../pages/learnPath/index";
import { LearnPathDetailPage } from "../pages/learnPath/detail";
import { ErrorPage } from "../pages/error/index";
import { WendaPage } from "../pages/wenda/index";
import { WendaDetailPage } from "../pages/wenda/detail";
import { SharePage } from "../pages/share";
import { StudyCenterPage } from "../pages/study/index";
import { TencentFaceCheckPage } from "../pages/auth/faceCheck";
import { BindNewMobilePage } from "../pages/auth/bindMobile";
import { AuthLoadingPage } from "../pages/auth/loading";
import PrivateRoute from "../components/private-route";
import { Error404 } from "../pages/error/404";

let RootPage: any = null;
let configFunc = {
  vip: true,
  live: false,
  book: false,
  topic: false,
  paper: false,
  practice: false,
  mockPaper: false,
  wrongBook: false,
  wenda: false,
  share: false,
  codeExchanger: false,
  snapshort: false,
  ke: false,
  promoCode: false,
  daySignIn: false,
  credit1Mall: false,
  tuangou: false,
  miaosha: false,
  cert: false,
};

if (getToken()) {
  RootPage = lazy(async () => {
    return new Promise<any>(async (resolve) => {
      try {
        let configRes: any = await system.config();
        let userRes: any = await user.detail();
        let navsRes: any = await home.headerNav();

        // 强制绑定手机号
        if (
          userRes.data.is_bind_mobile === 0 &&
          configRes.data.member.enabled_mobile_bind_alert === 1
        ) {
          setBindMobileKey();
        } else {
          clearBindMobileKey();
        }
        //强制实名认证
        if (
          userRes.data.is_face_verify === false &&
          configRes.data.member.enabled_face_verify === true
        ) {
          setFaceCheckKey();
        } else {
          clearFaceCheckKey();
        }

        configFunc.live = configRes.data.enabled_addons.indexOf("Zhibo") !== -1;
        configFunc.book =
          configRes.data.enabled_addons.indexOf("MeeduBooks") !== -1;
        configFunc.topic =
          configRes.data.enabled_addons.indexOf("MeeduTopics") !== -1;
        configFunc.paper =
          configRes.data.enabled_addons.indexOf("Paper") !== -1;
        configFunc.mockPaper =
          configRes.data.enabled_addons.indexOf("Paper") !== -1;
        configFunc.wrongBook =
          configRes.data.enabled_addons.indexOf("Paper") !== -1;
        configFunc.practice =
          configRes.data.enabled_addons.indexOf("Paper") !== -1;
        configFunc.wenda =
          configRes.data.enabled_addons.indexOf("Wenda") !== -1;
        configFunc.share =
          configRes.data.enabled_addons.indexOf("MultiLevelShare") !== -1;
        configFunc.codeExchanger =
          configRes.data.enabled_addons.indexOf("CodeExchanger") !== -1;
        configFunc.snapshort =
          configRes.data.enabled_addons.indexOf("Snapshot") !== -1;
        configFunc.ke =
          configRes.data.enabled_addons.indexOf("XiaoBanKe") !== -1;
        configFunc.promoCode =
          configRes.data.enabled_addons.indexOf("MultiLevelShar") !== -1;
        configFunc.daySignIn =
          configRes.data.enabled_addons.indexOf("DaySignIn") !== -1;
        configFunc.credit1Mall =
          configRes.data.enabled_addons.indexOf("Credit1Mall") !== -1;
        configFunc.tuangou =
          configRes.data.enabled_addons.indexOf("TuanGou") !== -1;
        configFunc.miaosha =
          configRes.data.enabled_addons.indexOf("MiaoSha") !== -1;
        configFunc.cert = configRes.data.enabled_addons.indexOf("Cert") !== -1;

        resolve({
          default: (
            <InitPage
              loginData={userRes.data}
              config={configRes.data}
              configFunc={configFunc}
              navsData={navsRes.data}
            />
          ),
        });
      } catch (e) {
        console.error("系统初始化失败", e);
      }
    });
  });
} else {
  RootPage = lazy(async () => {
    return new Promise<any>(async (resolve) => {
      try {
        let configRes: any = await system.config();
        let navsRes: any = await home.headerNav();

        configFunc.live = configRes.data.enabled_addons.indexOf("Zhibo") !== -1;
        configFunc.book =
          configRes.data.enabled_addons.indexOf("MeeduBooks") !== -1;
        configFunc.topic =
          configRes.data.enabled_addons.indexOf("MeeduTopics") !== -1;
        configFunc.paper =
          configRes.data.enabled_addons.indexOf("Paper") !== -1;
        configFunc.mockPaper =
          configRes.data.enabled_addons.indexOf("Paper") !== -1;
        configFunc.wrongBook =
          configRes.data.enabled_addons.indexOf("Paper") !== -1;
        configFunc.practice =
          configRes.data.enabled_addons.indexOf("Paper") !== -1;
        configFunc.wenda =
          configRes.data.enabled_addons.indexOf("Wenda") !== -1;
        configFunc.share =
          configRes.data.enabled_addons.indexOf("MultiLevelShare") !== -1;
        configFunc.codeExchanger =
          configRes.data.enabled_addons.indexOf("CodeExchanger") !== -1;
        configFunc.snapshort =
          configRes.data.enabled_addons.indexOf("Snapshot") !== -1;
        configFunc.ke =
          configRes.data.enabled_addons.indexOf("XiaoBanKe") !== -1;
        configFunc.promoCode =
          configRes.data.enabled_addons.indexOf("MultiLevelShar") !== -1;
        configFunc.daySignIn =
          configRes.data.enabled_addons.indexOf("DaySignIn") !== -1;
        configFunc.credit1Mall =
          configRes.data.enabled_addons.indexOf("Credit1Mall") !== -1;
        configFunc.tuangou =
          configRes.data.enabled_addons.indexOf("TuanGou") !== -1;
        configFunc.miaosha =
          configRes.data.enabled_addons.indexOf("MiaoSha") !== -1;
        configFunc.cert = configRes.data.enabled_addons.indexOf("Cert") !== -1;

        resolve({
          default: (
            <InitPage
              loginData={null}
              config={configRes.data}
              configFunc={configFunc}
              navsData={navsRes.data}
            />
          ),
        });
      } catch (e) {
        console.error("系统初始化失败", e);
      }
    });
  });
}

const routes: RouteObject[] = [
  {
    path: "/",
    element: RootPage,
    children: [
      {
        path: "/",
        element: <IndexPage />,
      },
      {
        path: "/login",
        element: <LoginPage />,
      },
      { path: "/login/callback", element: <AuthLoadingPage /> },
      { path: "/courses", element: <VodPage /> },
      { path: "/courses/detail", element: <VodDetailPage /> },
      {
        path: "/courses/video",
        element: <PrivateRoute Component={<VodPlayPage />} />,
      },
      { path: "/live", element: <LivePage /> },
      { path: "/live/detail", element: <LiveDetailPage /> },
      {
        path: "/live/video",
        element: <PrivateRoute Component={<LiveVideoPage />} />,
      },
      { path: "/announcement", element: <AnnouncementPage /> },
      { path: "/exam", element: <ExamPage /> },
      { path: "/exam/papers", element: <ExamPaperPage /> },
      {
        path: "/exam/papers/detail",
        element: <PrivateRoute Component={<ExamPaperDetailPage />} />,
      },
      {
        path: "/exam/papers/play",
        element: <PrivateRoute Component={<ExamPaperPlayPage />} />,
      },
      { path: "/exam/mockpaper", element: <ExamMockPaperPage /> },
      {
        path: "/exam/mockpaper/detail",
        element: <PrivateRoute Component={<ExamMockPaperDetailPage />} />,
      },
      {
        path: "/exam/mockpaper/play",
        element: <PrivateRoute Component={<ExamMockPaperPlayPage />} />,
      },
      { path: "/exam/practice", element: <ExamPracticePage /> },
      {
        path: "/exam/practice/detail",
        element: <PrivateRoute Component={<ExamPracticeDetailPage />} />,
      },
      {
        path: "/exam/practice/play",
        element: <PrivateRoute Component={<ExamPracticePlayPage />} />,
      },
      { path: "/exam/wrongbook", element: <ExamWrongbookPage /> },
      {
        path: "/exam/wrongbook/play",
        element: <PrivateRoute Component={<ExamWrongbookPlayPage />} />,
      },
      { path: "/exam/collection", element: <ExamCollectionPage /> },
      {
        path: "/exam/collection/play",
        element: <PrivateRoute Component={<ExamCollectionPlayPage />} />,
      },
      { path: "/member", element: <PrivateRoute Component={<MemberPage />} /> },
      {
        path: "/member/messages",
        element: <PrivateRoute Component={<MemberMessagesPage />} />,
      },
      {
        path: "/member/orders",
        element: <PrivateRoute Component={<MemberOrdersPage />} />,
      },
      {
        path: "/member/paper",
        element: <PrivateRoute Component={<MemberPaperPage />} />,
      },
      {
        path: "/member/mockpaper",
        element: <PrivateRoute Component={<MemberMockPaperPage />} />,
      },
      {
        path: "/member/practice",
        element: <PrivateRoute Component={<MemberPracticePage />} />,
      },
      {
        path: "/member/questions",
        element: <PrivateRoute Component={<MemberQuestionsPage />} />,
      },
      {
        path: "/member/code-exchanger",
        element: <PrivateRoute Component={<MemberExchangerPage />} />,
      },
      {
        path: "/member/credit1-free",
        element: <PrivateRoute Component={<MemberCredit1FreePage />} />,
      },
      {
        path: "/member/credit1-records",
        element: <PrivateRoute Component={<MemberCredit1RecordsPage />} />,
      },
      {
        path: "/member/certs",
        element: <PrivateRoute Component={<MemberCertsPage />} />,
      },
      { path: "/vip", element: <RolePage /> },
      { path: "/order", element: <PrivateRoute Component={<OrderPage />} /> },
      {
        path: "/order/pay",
        element: <PrivateRoute Component={<OrderPayPage />} />,
      },
      {
        path: "/order/success",
        element: <PrivateRoute Component={<OrderSuccessPage />} />,
      },
      { path: "/search", element: <SearchPage /> },
      { path: "/topic", element: <TopicPage /> },
      { path: "/topic/detail", element: <TopicDetailPage /> },
      { path: "/book", element: <BookPage /> },
      { path: "/book/detail", element: <BookDetailPage /> },
      {
        path: "/book/read",
        element: <PrivateRoute Component={<BookReadPage />} />,
      },
      { path: "/learnPath", element: <LearnPathPage /> },
      { path: "/learnPath/detail", element: <LearnPathDetailPage /> },
      { path: "/error", element: <ErrorPage /> },
      { path: "/wenda", element: <WendaPage /> },
      { path: "/wenda/detail", element: <WendaDetailPage /> },
      { path: "/share", element: <PrivateRoute Component={<SharePage />} /> },
      {
        path: "/study-center",
        element: <PrivateRoute Component={<StudyCenterPage />} />,
      },
      { path: "/face-check", element: <TencentFaceCheckPage /> },
      { path: "/bind-mobile", element: <BindNewMobilePage /> },
    ],
  },
  { path: "/*", element: <Error404 /> },
];

export default routes;
