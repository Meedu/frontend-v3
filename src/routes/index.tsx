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

const IndexPage = lazy(() => import("../pages/index"));
// 录播相关页面
const VodPage = lazy(() => import("../pages/vod/index"));
const VodDetailPage = lazy(() => import("../pages/vod/detail"));
const VodPlayPage = lazy(() => import("../pages/vod/video"));
// 直播相关页面
const LivePage = lazy(() => import("../pages/live/index"));
const LiveDetailPage = lazy(() => import("../pages/live/detail"));
const LiveVideoPage = lazy(() => import("../pages/live/video"));
// 其它
const AnnouncementPage = lazy(() => import("../pages/announcement/index"));
// 考试相关页面
const ExamPage = lazy(() => import("../pages/exam/index"));
const ExamPaperPage = lazy(() => import("../pages/exam/paper/index"));
const ExamPaperDetailPage = lazy(() => import("../pages/exam/paper/detail"));
const ExamPaperPlayPage = lazy(() => import("../pages/exam/paper/play"));
// 模拟考试
const ExamMockPaperPage = lazy(() => import("../pages/exam/mock/index"));
const ExamMockPaperDetailPage = lazy(() => import("../pages/exam/mock/detail"));
const ExamMockPaperPlayPage = lazy(() => import("../pages/exam/mock/play"));
// 在线练习
const ExamPracticePage = lazy(() => import("../pages/exam/practice/index"));
const ExamPracticeDetailPage = lazy(
  () => import("../pages/exam/practice/detail")
);
const ExamPracticePlayPage = lazy(() => import("../pages/exam/practice/play"));
// 考试其它
const ExamWrongbookPage = lazy(() => import("../pages/exam/wrongbook/index"));
const ExamWrongbookPlayPage = lazy(
  () => import("../pages/exam/wrongbook/play")
);
const ExamCollectionPage = lazy(() => import("../pages/exam/collection/index"));
const ExamCollectionPlayPage = lazy(
  () => import("../pages/exam/collection/play")
);
// 学员相关
const MemberPage = lazy(() => import("../pages/member/index"));
const MemberMessagesPage = lazy(() => import("../pages/member/messages"));
const MemberOrdersPage = lazy(() => import("../pages/member/orders"));
const MemberPaperPage = lazy(() => import("../pages/member/paper"));
const MemberMockPaperPage = lazy(() => import("../pages/member/mock-paper"));
const MemberPracticePage = lazy(() => import("../pages/member/practice"));
const MemberQuestionsPage = lazy(() => import("../pages/member/questions"));
const MemberExchangerPage = lazy(() => import("../pages/member/codeexchanger"));
const MemberCredit1FreePage = lazy(
  () => import("../pages/member/credit1-free")
);
const MemberCredit1RecordsPage = lazy(
  () => import("../pages/member/credit1-records")
);
const MemberCertsPage = lazy(() => import("../pages/member/certs"));
//会员
const RolePage = lazy(() => import("../pages/role"));
//订单相关
const OrderPage = lazy(() => import("../pages/order/index"));
const OrderPayPage = lazy(() => import("../pages/order/pay"));
const OrderSuccessPage = lazy(() => import("../pages/order/success"));
//搜索
const SearchPage = lazy(() => import("../pages/search"));
//图文相关
const TopicPage = lazy(() => import("../pages/topic/index"));
const TopicDetailPage = lazy(() => import("../pages/topic/detail"));
//电子书相关
const BookPage = lazy(() => import("../pages/book/index"));
const BookDetailPage = lazy(() => import("../pages/book/detail"));
const BookReadPage = lazy(() => import("../pages/book/read"));
//路径相关
const LearnPathPage = lazy(() => import("../pages/learnPath/index"));
const LearnPathDetailPage = lazy(() => import("../pages/learnPath/detail"));
//问答相关
const WendaPage = lazy(() => import("../pages/wenda/index"));
const WendaDetailPage = lazy(() => import("../pages/wenda/detail"));
//推广
const SharePage = lazy(() => import("../pages/share"));
//学习中心
const StudyCenterPage = lazy(() => import("../pages/study/index"));
//实人认证
const TencentFaceCheckPage = lazy(() => import("../pages/auth/faceCheck"));
//绑定手机号
const BindNewMobilePage = lazy(() => import("../pages/auth/bindMobile"));
//加载...
const AuthLoadingPage = lazy(() => import("../pages/auth/loading"));
//错误相关
const ErrorPage = lazy(() => import("../pages/error/index"));
const Error404 = lazy(() => import("../pages/error/404"));
import PrivateRoute from "../components/private-route";

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
