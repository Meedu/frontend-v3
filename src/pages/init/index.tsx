import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { message } from "antd";
import { useNavigate, Outlet } from "react-router-dom";
import { loginAction } from "../../store/user/loginUserSlice";
import {
  saveConfigAction,
  saveConfigFuncAction,
} from "../../store/system/systemConfigSlice";
import { saveNavsAction } from "../../store/nav-menu/navMenuConfigSlice";
import { BackTop, CodeLoginBindMobileDialog } from "../../components";
import { useLocation } from "react-router-dom";
import { user, share, login } from "../../api";
import {
  saveMsv,
  getMsv,
  clearMsv,
  saveSessionLoginCode,
  getSessionLoginCode,
  setToken,
  saveLoginCode,
  isMobile,
  SPAUrlAppend,
} from "../../utils/index";

interface Props {
  loginData: any;
  config: any;
  configFunc: any;
  navsData: any;
}

export const InitPage = (props: Props) => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [backTopStatus, setBackTopStatus] = useState<boolean>(false);
  const [codebindmobileVisible, setCodebindmobileVisible] =
    useState<boolean>(false);

  //-----监听滚动条-----
  const getHeight = () => {
    let scrollTop =
      document.documentElement.scrollTop || document.body.scrollTop;
    setBackTopStatus(scrollTop >= 2000);
  };
  useEffect(() => {
    window.addEventListener("scroll", getHeight, true);

    return () => {
      window.removeEventListener("scroll", getHeight, true);
    };
  }, []);

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    if (searchParams) {
      // msv分销id记录
      let msv = searchParams.get("msv");
      if (msv) {
        saveMsv(msv);
      }
      // 社交登录回调处理
      let loginCode = searchParams.get("login_code");
      let action = searchParams.get("action");
      let redirectUrl = decodeURIComponent(searchParams.get("redirect") || "/");
      if (loginCode && action === "login") {
        codeLogin(loginCode, redirectUrl);
      }
    }
  }, [location.search]);

  const codeLogin = (code: string, redirectUrl: string) => {
    // 重复请求检测
    if (getSessionLoginCode(code)) {
      return;
    }
    saveSessionLoginCode(code);

    // 请求登录接口
    login
      .codeLogin({ code: code, msv: getMsv() })
      .then((res: any) => {
        if (res.data.success === 1) {
          setToken(res.data.token);
          user.detail().then((res: any) => {
            let loginData = res.data;
            // 将学员数据存储到store
            dispatch(loginAction(loginData));
            // 登录成功之后的跳转
            if (window.location.pathname === "/login/callback") {
              // 社交登录回调指定的跳转地址
              navigate(redirectUrl, { replace: true });
            } else {
              // 直接reload当前登录表单所在页面
              let path = window.location.pathname + window.location.search;
              navigate(path, { replace: true });
            }
          });
        } else {
          if (res.data.action === "bind_mobile") {
            saveLoginCode(code);
            setCodebindmobileVisible(true);
          }
        }
      })
      .catch((e) => {
        message.error(e.message);
      });
  };

  const msvBind = () => {
    let msv = getMsv();
    if (!msv) {
      return;
    }
    share
      .bind({ msv: msv })
      .then(() => {
        clearMsv();
      })
      .catch((e: any) => {
        console.error(e);
        clearMsv();
      });
  };

  if (props.loginData) {
    dispatch(loginAction(props.loginData));
    msvBind();
  }

  if (props.config) {
    dispatch(saveConfigAction(props.config));

    // 手机设备访问PC站点 && 配置了H5站点的地址
    if (isMobile() && props.config.h5_url) {
      let url = props.config.h5_url;
      let curPathname = window.location.pathname;
      let curSearch = window.location.search || "";

      if (curPathname.indexOf("/topic/detail") !== -1) {
        let id = curPathname.slice(14);
        if (curSearch === "") {
          url += "/#/pages/webview/webview?course_type=topic&id=" + id;
        } else {
          url +=
            "/#/pages/webview/webview" +
            curSearch +
            "&course_type=topic&id=" +
            id;
        }
      } else if (curPathname.indexOf("/courses/detail") !== -1) {
        let id = curPathname.slice(16);
        if (curSearch === "") {
          url += "/#/pages/course/show?id=" + id;
        } else {
          url += "/#/pages/course/show" + curSearch + "&id=" + id;
        }
      } else if (curPathname.indexOf("/courses/video") !== -1) {
        url += "/#/pages/course/video" + curSearch;
      } else if (curPathname.indexOf("/live/detail") !== -1) {
        let id = curPathname.slice(13);
        if (curSearch === "") {
          url += "/#/packageA/live/show?id=" + id;
        } else {
          url += "/#/packageA/live/show" + curSearch + "&id=" + id;
        }
      } else if (curPathname.indexOf("/live/video") !== -1) {
        let id = curPathname.slice(12);
        if (curSearch === "") {
          url += "/#/packageA/live/video?id=" + id;
        } else {
          url += "/#/packageA/live/video" + curSearch + "&id=" + id;
        }
      } else if (curPathname.indexOf("/book/detail") !== -1) {
        let id = curPathname.slice(13);
        if (curSearch === "") {
          url += "/#/packageA/book/show?id=" + id;
        } else {
          url += "/#/packageA/book/show" + curSearch + "&id=" + id;
        }
      } else if (curPathname.indexOf("/book/read") !== -1) {
        url += "/#/pages/webview/webview" + curSearch + "&course_type=book";
      } else if (curPathname.indexOf("/learnPath/detail") !== -1) {
        let id = curPathname.slice(18);
        if (curSearch === "") {
          url += "/#/packageA/learnPath/show?id=" + id;
        } else {
          url += "/#/packageA/learnPath/show" + curSearch + "&id=" + id;
        }
      } else if (curPathname.indexOf("/exam/papers/detail") !== -1) {
        let id = curPathname.slice(20);
        if (curSearch === "") {
          url += "/#/pages/webview/webview?course_type=paperRead&id=" + id;
        } else {
          url +=
            "/#/pages/webview/webview" +
            curSearch +
            "&course_type=paperRead&id=" +
            id;
        }
      } else if (curPathname.indexOf("/exam/practice/detail") !== -1) {
        let id = curPathname.slice(22);
        if (curSearch === "") {
          url += "/#/pages/webview/webview?course_type=practiceRead&id=" + id;
        } else {
          url +=
            "/#/pages/webview/webview" +
            curSearch +
            "&course_type=practiceRead&id=" +
            id;
        }
      } else if (curPathname.indexOf("/exam/mockpaper/detail") !== -1) {
        let id = curPathname.slice(23);
        if (curSearch === "") {
          url += "/#/pages/webview/webview?course_type=mockRead&id=" + id;
        } else {
          url +=
            "/#/pages/webview/webview" +
            curSearch +
            "&course_type=mockRead&id=" +
            id;
        }
      }

      // 如果存在msv的话则携带上msv(邀请学员的id)
      const searchParams = new URLSearchParams(location.search);
      if (searchParams.get("msv")) {
        url = SPAUrlAppend(
          props.config.h5_url,
          "msv=" + searchParams.get("msv")
        );
      }

      // 跳转到手机访问地址
      window.location.href = url;
    }
  }
  if (props.configFunc) {
    dispatch(saveConfigFuncAction(props.configFunc));
  }

  if (props.navsData) {
    dispatch(saveNavsAction(props.navsData));
  }

  return (
    <>
      <CodeLoginBindMobileDialog
        scene="mobile_bind"
        open={codebindmobileVisible}
        onCancel={() => setCodebindmobileVisible(false)}
        success={() => {
          setCodebindmobileVisible(false);
        }}
      ></CodeLoginBindMobileDialog>
      <div style={{ minHeight: 800 }}>
        <Outlet />
      </div>
      {backTopStatus ? <BackTop></BackTop> : null}
    </>
  );
};
