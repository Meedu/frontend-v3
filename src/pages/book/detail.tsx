import { useState, useEffect } from "react";
import styles from "./detail.module.scss";
import { Skeleton, message } from "antd";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { book as bookApi, miaosha, tuangou } from "../../api/index";
import {
  HistoryRecord,
  MiaoshaDialog,
  ThumbBar,
  MiaoshaList,
  TuangouList,
  BookCourseComments,
} from "../../components";
import { latexRender, codeRender } from "../../utils/index";
import collectIcon from "../../assets/img/commen/icon-collect-h.png";
import noCollectIcon from "../../assets/img/commen/icon-collect-n.png";
import appConfig from "../../js/config";

const BookDetailPage = () => {
  const navigate = useNavigate();
  const result = new URLSearchParams(useLocation().search);
  const params = useParams();
  const [loading, setLoading] = useState<boolean>(false);
  const [commentLoading, setCommentLoading] = useState<boolean>(false);
  const [bid, setBid] = useState(Number(params.courseId));
  const [book, setBook] = useState<any>({});
  const [isLike, setIsLike] = useState<boolean>(false);
  const [isBuy, setIsBuy] = useState<boolean>(false);
  const [chapters, setChapters] = useState<any>([]);
  const [articles, setArticles] = useState<any>({});
  const [msData, setMsData] = useState<any>({});
  const [msVisible, setMsVisible] = useState<boolean>(false);
  const [tgData, setTgData] = useState<any>({});
  const [hideButton, setHideButton] = useState<boolean>(false);
  const [comments, setComments] = useState<any>([]);
  const [commentUsers, setCommentUsers] = useState<any>({});
  const [currentTab, setCurrentTab] = useState(Number(result.get("tab")) || 2);
  const [isfixTab, setIsfixTab] = useState<boolean>(false);
  const configFunc = useSelector(
    (state: any) => state.systemConfig.value.configFunc
  );
  const isLogin = useSelector((state: any) => state.loginUser.value.isLogin);
  const tabs = [
    {
      name: "详情",
      id: 2,
    },
    {
      name: "目录",
      id: 3,
    },
    {
      name: "评论",
      id: 4,
    },
  ];

  useEffect(() => {
    getDetail();
    getComments();
    getLikeStatus();
    window.addEventListener("scroll", handleTabFix, true);
    return () => {
      window.removeEventListener("scroll", handleTabFix, true);
    };
  }, [bid]);

  useEffect(() => {
    latexRender(document.getElementById("desc"));
    codeRender(document.getElementById("desc"));
  }, [document.getElementById("desc")]);

  const getDetail = () => {
    if (loading) {
      return;
    }
    setLoading(true);
    bookApi.detail(bid).then((res: any) => {
      document.title = res.data.book.name;
      setBook(res.data.book);
      let chaps = res.data.chapters;
      let arts = res.data.articles;
      if (chaps.length > 0 && arts[0] && arts[0].length > 0) {
        chaps.push({
          id: 0,
          name: "无章节内容",
          sort: 10000,
        });
      }
      setChapters(chaps);
      setArticles(arts);
      setIsBuy(res.data.is_buy);
      //获取秒杀信息
      if (!res.data.is_buy && configFunc["miaosha"]) {
        getMsDetail();
      }

      //获取团购信息
      else if (!res.data.is_buy && configFunc["tuangou"]) {
        getTgDetail();
      }

      setLoading(false);
    });
  };

  const getLikeStatus = () => {
    bookApi
      .likeStatus({
        id: bid,
        type: "book",
      })
      .then((res: any) => {
        setIsLike(res.data.like);
      });
  };

  const getComments = () => {
    if (commentLoading) {
      return;
    }
    setCommentLoading(true);
    bookApi
      .bookComments(bid, {
        page: 1,
        size: 10000,
      })
      .then((res: any) => {
        setComments(res.data.data.data);
        setCommentUsers(res.data.users);
        setCommentLoading(false);
      });
  };

  const resetComments = () => {
    setCommentLoading(false);
    setComments([]);
    setCommentUsers({});
  };

  const getMsDetail = () => {
    if (book.charge === 0) {
      return;
    }
    miaosha
      .detail(0, {
        course_id: bid,
        course_type: "book",
      })
      .then((res: any) => {
        setMsData(res.data);
        if (!res.data.data && !isBuy && configFunc["tuangou"]) {
          getTgDetail();
        }
      });
  };
  const getTgDetail = () => {
    if (book.charge === 0) {
      return;
    }
    tuangou
      .detail(0, {
        course_id: bid,
        course_type: "book",
      })
      .then((res: any) => {
        setTgData(res.data);
        setHideButton(res.data.join_item && res.data.join_item.length !== 0);
      });
  };

  const tabChange = (id: number) => {
    setCurrentTab(id);
    navigate("/book/detail/" + bid + "?tab=" + id);
  };

  const goLogin = () => {
    let url = encodeURIComponent(
      window.location.pathname + window.location.search
    );
    navigate("/login?redirect=" + url);
  };

  const handleTabFix = () => {
    let scrollTop =
      window.pageYOffset ||
      document.documentElement.scrollTop ||
      document.body.scrollTop;
    let navbar = document.querySelector("#NavBar") as HTMLElement;
    if (navbar) {
      let offsetTop = navbar.offsetTop;
      scrollTop > offsetTop ? setIsfixTab(true) : setIsfixTab(false);
    }
  };

  const goMsOrder = (id: number) => {
    navigate(
      "/order?course_id=" +
        msData.data.goods_id +
        "&course_type=" +
        msData.data.goods_type +
        "&goods_type=ms&goods_charge=" +
        msData.data.charge +
        "&goods_label=秒杀&goods_name=" +
        msData.data.goods_title +
        "&goods_id=" +
        id +
        "&goods_thumb=" +
        msData.data.goods_thumb
    );
  };

  const openMsDialog = () => {
    if (!isLogin) {
      goLogin();
      return;
    }
    setMsVisible(true);
  };

  const goRole = () => {
    navigate("/vip");
  };

  const likeHit = () => {
    if (isLogin) {
      bookApi
        .likeHit({
          id: bid,
          type: "book",
        })
        .then((res) => {
          setIsLike(!isLike);
          if (isLike) {
            message.success("取消收藏");
          } else {
            message.success("已收藏");
          }
        });
    } else {
      goLogin();
    }
  };

  const goRead = (item: any) => {
    if (!isLogin) {
      goLogin();
      return;
    }
    if (book.charge > 0 && item.charge > 0 && isBuy === false) {
      buyBook();
      return;
    }
    navigate("/book/read/" + item.id);
  };

  const startLearn = () => {
    if (articles.length === 0) {
      message.error("当前电子书下暂无文章");
      return;
    }
    let article = null;
    if (chapters.length === 0) {
      // 无章节电子书
      article = articles[0][0];
    } else {
      for (let i = 0; i < chapters.length; i++) {
        article = articles[chapters[i].id][0];
        if (article) {
          break;
        }
      }
    }

    if (!article) {
      message.error("当前电子书下暂无文章");
      return;
    }

    goRead(article);
  };

  const buyBook = () => {
    if (!isLogin) {
      goLogin();
      return;
    }
    navigate(
      "/order?goods_id=" +
        bid +
        "&goods_type=book&goods_charge=" +
        book.charge +
        "&goods_label=电子书&goods_name=" +
        book.name +
        "&goods_thumb=" +
        book.thumb
    );
  };

  const goPay = (gid = 0) => {
    if (!isLogin) {
      goLogin();
      return;
    }
    navigate(
      "/order?course_id=" +
        tgData.goods.other_id +
        "&course_type=" +
        tgData.goods.goods_type +
        "&goods_type=tg&goods_charge=" +
        tgData.goods.charge +
        "&goods_label=团购&goods_name=" +
        tgData.goods.goods_title +
        "&goods_id=" +
        tgData.goods.id +
        "&goods_thumb=" +
        tgData.goods.goods_thumb +
        "&tg_gid=" +
        gid
    );
  };

  return (
    <>
      {isfixTab && (
        <div className="fix-nav">
          <div className="course-tabs">
            {tabs.map((item: any) => (
              <div
                key={item.id}
                className={
                  currentTab === item.id ? "active item-tab" : "item-tab"
                }
                onClick={() => tabChange(item.id)}
              >
                {item.name}
                {currentTab === item.id && <div className="actline"></div>}
              </div>
            ))}
          </div>
        </div>
      )}
      <div className="container">
        <div className="bread-nav">
          {loading && (
            <Skeleton.Button
              active
              style={{
                width: 1200,
                height: 14,
                marginLeft: 0,
              }}
            ></Skeleton.Button>
          )}
          {!loading && (
            <>
              <a
                onClick={() => {
                  navigate("/");
                }}
              >
                首页
              </a>{" "}
              /
              <a
                onClick={() => {
                  navigate("/book");
                }}
              >
                电子书
              </a>{" "}
              /<span>{book.name}</span>
            </>
          )}
        </div>
        <HistoryRecord id={book.id} title={book.name} type="book" />
        {!isBuy && msData && (
          <MiaoshaDialog
            open={msVisible}
            msData={msData}
            onCancel={() => setMsVisible(false)}
          />
        )}
        <div className={styles["book-info"]}>
          <div className={styles["book-info-box"]}>
            <div className={styles["book-thumb"]}>
              {loading && (
                <Skeleton.Button
                  active
                  style={{
                    width: 240,
                    height: 320,
                    borderRadius: 8,
                  }}
                ></Skeleton.Button>
              )}
              <ThumbBar
                value={book.thumb}
                width={240}
                height={320}
                border={null}
              />
            </div>
            <div className={styles["info"]}>
              {loading && (
                <div
                  style={{
                    width: 710,
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <Skeleton.Button
                    active
                    style={{
                      width: 710,
                      height: 30,
                      marginTop: 20,
                    }}
                  ></Skeleton.Button>
                  <Skeleton.Button
                    active
                    style={{
                      width: 710,
                      height: 16,
                      marginTop: 21,
                    }}
                  ></Skeleton.Button>
                </div>
              )}
              <div className={styles["book-info-title"]}>{book.name}</div>
              {isLike && (
                <img
                  onClick={() => {
                    likeHit();
                  }}
                  className={styles["collect-button"]}
                  src={collectIcon}
                />
              )}
              {!isLike && (
                <img
                  onClick={() => {
                    likeHit();
                  }}
                  className={styles["collect-button"]}
                  src={noCollectIcon}
                />
              )}
              <p className={styles["desc"]}>{book.short_desc}</p>
              <div className={styles["btn-box"]}>
                {isBuy && (
                  <div
                    className={styles["see-button"]}
                    onClick={() => startLearn()}
                  >
                    开始阅读
                  </div>
                )}
                {!isBuy && book.charge !== 0 && (
                  <>
                    {msData && msData.data && (
                      <>
                        {msData.order && msData.order.status === 0 && (
                          <div
                            className={styles["buy-button"]}
                            onClick={() => goMsOrder(msData.order.id)}
                          >
                            已获得秒杀资格，请尽快支付
                          </div>
                        )}
                        {(!msData.order || msData.order.status !== 0) &&
                          !msData.data.is_over && (
                            <div
                              className={styles["buy-button"]}
                              onClick={() => openMsDialog()}
                            >
                              立即秒杀￥{msData.data.charge}
                            </div>
                          )}
                      </>
                    )}
                    {(!msData || !msData.data) && (
                      <>
                        {hideButton && (
                          <div className={styles["has-button"]}>正在拼团中</div>
                        )}
                        {!hideButton && book.charge > 0 && (
                          <div
                            className={styles["buy-button"]}
                            onClick={() => buyBook()}
                          >
                            订阅电子书￥{book.charge}
                          </div>
                        )}
                        {book.charge > 0 &&
                          book.is_vip_free === 1 &&
                          !appConfig.disable_vip && (
                            <div
                              className={styles["role-button"]}
                              onClick={() => goRole()}
                            >
                              会员免费看
                            </div>
                          )}
                        {tgData &&
                          tgData.goods &&
                          (!tgData.join_item ||
                            tgData.join_item.length === 0) && (
                            <div
                              className={styles["role-button"]}
                              onClick={() => goPay(0)}
                            >
                              单独开团￥{tgData.goods.charge}
                            </div>
                          )}
                      </>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
          {!isBuy && msData && <MiaoshaList msData={msData} />}
          {!isBuy && msData && <TuangouList tgData={tgData} />}
          <div className="course-tabs" id="NavBar">
            {tabs.map((item: any) => (
              <div
                key={item.id}
                className={
                  currentTab === item.id ? "active item-tab" : "item-tab"
                }
                onClick={() => tabChange(item.id)}
              >
                {item.name}
                {currentTab === item.id && <div className="actline"></div>}
              </div>
            ))}
          </div>
        </div>
        {currentTab === 2 && (
          <div className={styles["book-desc"]}>
            <div
              className="u-content md-content"
              id="desc"
              dangerouslySetInnerHTML={{ __html: book.render_desc }}
            ></div>
          </div>
        )}
        {currentTab === 3 && (
          <div className={styles["book-chapter-box"]}>
            {chapters.length > 0 &&
              chapters.map((chapter: any) => (
                <div key={chapter.id} className={styles["chapter-item"]}>
                  <div className={styles["chapter-name"]}>{chapter.name}</div>
                  {articles[chapter.id] && articles[chapter.id].length > 0 && (
                    <div className={styles["chapter-videos-box"]}>
                      {articles[chapter.id].map((articleItem: any) => (
                        <div
                          key={articleItem.id}
                          className={styles["book-item"]}
                          onClick={() => goRead(articleItem)}
                        >
                          <div className={styles["video-title"]}>
                            <div className={styles["text"]}>
                              {articleItem.title}
                            </div>
                            {!isBuy &&
                              book.charge > 0 &&
                              articleItem.charge === 0 && (
                                <div className={styles["free"]}>试读</div>
                              )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            {chapters.length === 0 && articles[0] && articles[0].length > 0 && (
              <div className={styles["chapter-item"]}>
                <div className={styles["chapter-videos-box"]}>
                  {articles[0].map((articleItem: any) => (
                    <div
                      key={articleItem.id}
                      className={styles["book-itemsp"]}
                      onClick={() => goRead(articleItem)}
                    >
                      <div className={styles["video-title"]}>
                        <div className={styles["text"]}>
                          {articleItem.title}
                        </div>
                        {!isBuy &&
                          book.charge > 0 &&
                          articleItem.charge === 0 && (
                            <div className={styles["free"]}>试读</div>
                          )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
        {currentTab === 4 && (
          <BookCourseComments
            bid={bid}
            isBuy={isBuy}
            comments={comments}
            commentUsers={commentUsers}
            success={() => {
              resetComments();
              getComments();
            }}
          />
        )}
      </div>
    </>
  );
};

export default BookDetailPage;
