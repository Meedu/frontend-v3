import { useState, useEffect } from "react";
import styles from "./read.module.scss";
import { Col, Skeleton, message, Input, Button } from "antd";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { book as bookApi } from "../../api/index";
import { getCommentTime, latexRender, codeRender } from "../../utils/index";
import { Empty } from "../../components";
import backIcon from "../../assets/img/commen/icon-back-h.png";
import defaultAvatar from "../../assets/img/commen/default-avatar.jpg";
import appConfig from "../../js/config";

const BookReadPage = () => {
  const navigate = useNavigate();
  const params = useParams();
  const [id, setId] = useState(Number(params.courseId));
  const [book, setBook] = useState<any>({});
  const [list, setList] = useState<any>({});
  const [chapters, setChapters] = useState<any>([]);
  const [articles, setArticles] = useState<any>({});
  const [isBuy, setIsBuy] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [canSee, setCanSee] = useState<boolean>(false);
  const [indexText, setIndexText] = useState<string>("展开目录");
  const [indexStaus, setIndexStaus] = useState<boolean>(false);
  const [prevId, setPrevId] = useState<number>(0);
  const [nextId, setNextId] = useState<number>(0);
  const [comments, setComments] = useState<any>([]);
  const [commentUsers, setCommentUsers] = useState<any>({});
  const [commentLoading, setCommentLoading] = useState<boolean>(false);
  const [content, setContent] = useState<string>("");
  const [configInput, setConfigInput] = useState<any>([]);
  const [replyAnswers, setReplyAnswers] = useState<any>([]);
  const [configkey, setConfigkey] = useState<any>([]);
  const [replyContent, setReplyContent] = useState<string>("");
  const [answerId, setAnswerId] = useState(0);
  const [commentId, setCommentId] = useState<number>(0);
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(10000);
  const user = useSelector((state: any) => state.loginUser.value.user);
  const isLogin = useSelector((state: any) => state.loginUser.value.isLogin);

  useEffect(() => {
    getData();
    getComments();
  }, [id]);

  useEffect(() => {
    setId(Number(params.courseId));
  }, [params.courseId]);

  useEffect(() => {
    latexRender(document.getElementById("desc"));
    codeRender(document.getElementById("desc"));
  }, [document.getElementById("desc")]);

  const getData = () => {
    if (loading) {
      return;
    }
    setLoading(true);
    bookApi.articleRead(id).then((res: any) => {
      document.title = res.data.article.title;
      setBook(res.data.book);
      setList(res.data.article);
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
      setIsBuy(res.data.can_see);
      setCanSee(res.data.can_see);
      let pid = parseInt(res.data.prev_id);
      setPrevId(pid);
      let nid = parseInt(res.data.next_id);
      setNextId(nid);
      setLoading(false);
    });
  };

  const getComments = () => {
    if (commentLoading) {
      return;
    }
    setCommentLoading(true);
    bookApi
      .comments(id, {
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

  const goDetail = () => {
    navigate("/book/detail/" + book.id + "?tab=3");
  };

  const showIndex = () => {
    if (!indexStaus) {
      setIndexText("收起目录");
    } else {
      setIndexText("展开目录");
    }
    setIndexStaus(!indexStaus);
  };

  const switchArticle = (articleId: number) => {
    if (articleId === id) {
      return;
    }
    if (prevId === 0) {
      message.error("没有上一节");
      return;
    }
    resetComments();
    navigate("/book/read/" + articleId);
    setId(articleId);
    document.body.scrollTop = document.documentElement.scrollTop = 0;
  };

  const switchArticle2 = (articleId: number) => {
    if (articleId === id) {
      return;
    }
    if (nextId === 0) {
      message.error("没有下一节");
      return;
    }
    resetComments();
    navigate("/book/read/" + articleId);
    setId(articleId);
    document.body.scrollTop = document.documentElement.scrollTop = 0;
  };

  const goRead = (item: any) => {
    if (item.id === list.id) {
      return;
    }
    resetComments();
    navigate("/book/read/" + item.id);
    setId(item.id);
    document.body.scrollTop = document.documentElement.scrollTop = 0;
  };

  const goRole = () => {
    navigate("/vip");
  };

  const buyBook = () => {
    navigate(
      "/order?goods_id=" +
        book.id +
        "&goods_type=book&goods_charge=" +
        book.charge +
        "&goods_label=电子书&goods_name=" +
        book.name +
        "&goods_thumb=" +
        book.thumb
    );
  };

  const submitComment = () => {
    if (commentLoading) {
      return;
    }
    if (content === "") {
      return;
    }
    setCommentLoading(true);
    bookApi
      .submitComment(id, { content: content })
      .then((res: any) => {
        message.success("评论成功");
        let item = {
          id: res.data.comment_id,
          is_check: 0,
          parent_id: 0,
          content: content,
          children_count: 0,
          reply_id: 0,
          reply: null,
          created_at: "刚刚",
          user: {
            avatar: user.avatar,
            nick_name: user.nick_name,
          },
        };
        let list = [...comments];
        list.unshift(item);
        setComments(list);
        let answers = [...replyAnswers];
        answers.unshift(false);
        setReplyAnswers(answers);
        let keys = [...configkey];
        keys.unshift(false);
        setConfigkey(keys);
        setContent("");
        setCommentLoading(false);
      })
      .catch((e: any) => {
        setCommentLoading(false);
      });
  };

  const showReply = (id: number) => {
    if (!isLogin) {
      goLogin();
      return;
    }
    let arr = [];
    arr[id] = true;
    setConfigInput(arr);
    setReplyContent("");
  };

  const goLogin = () => {
    let url = encodeURIComponent(
      window.location.pathname + window.location.search
    );
    navigate("/login?redirect=" + url);
  };

  const getAnswer = (index: number, id: number) => {
    if (id === 0) {
      return;
    }
    let keys = [...configkey];
    keys[index] = !keys[index];
    setConfigkey(keys);
    setCommentId(id);
    bookApi
      .answerComments(list.id, {
        page: page,
        page_size: size,
        parent_id: id,
      })
      .then((res: any) => {
        let arr1 = [...replyAnswers];
        arr1[index] = res.data.data.data;
        setReplyAnswers(arr1);
      });
  };

  const reply = (
    parentId: number,
    id: any,
    nick_name: string,
    index: number
  ) => {
    if (commentLoading) {
      return;
    }
    if (!nick_name) {
      message.error("回复的用户不存在");
      return;
    }
    if (!replyContent) {
      return;
    }
    setAnswerId(id);
    setCommentLoading(true);
    bookApi
      .submitComment(list.id, {
        parent_id: parentId,
        content: replyContent,
        reply_id: id,
      })
      .then((res: any) => {
        let articleId = list.id;
        setConfigInput([]);
        message.success("回复成功");
        setCommentLoading(false);
        let item;
        if (id) {
          item = {
            id: res.data.comment_id,
            parent_id: parentId,
            content: replyContent,
            children_count: 0,
            reply_id: res.data.reply_id,
            created_at: "刚刚",
            user: {
              avatar: user.avatar,
              nick_name: user.nick_name,
            },
          };
          let old;
          if (replyAnswers[index]) {
            old = replyAnswers[index];
            old.unshift(item);
          } else {
            old = [];
          }
          let arr1 = [...replyAnswers];
          arr1[index] = old;
          setReplyAnswers(arr1);
          let list = [...comments];
          list[index].children_count = list[index].children_count + 1;
          setComments(list);
          setReplyContent("");
        } else {
          item = {
            id: res.data.comment_id,
            parent_id: parentId,
            content: replyContent,
            children_count: 0,
            reply_id: res.data.reply_id,
            reply: null,
            created_at: "刚刚",
            user: {
              avatar: user.avatar,
              nick_name: user.nick_name,
            },
          };
          let old;
          if (replyAnswers[index]) {
            old = replyAnswers[index];
            old.unshift(item);
          } else {
            old = [];
          }
          let arr1 = [...replyAnswers];
          arr1[index] = old;
          setReplyAnswers(arr1);
          let list = [...comments];
          list[index].children_count = list[index].children_count + 1;
          setComments(list);
          setReplyContent("");
          let arr2 = [...configkey];
          arr2[index] = true;
          setConfigkey(arr2);
          setCommentId(parentId);
          bookApi
            .answerComments(articleId, {
              page: page,
              page_size: size,
              parent_id: parentId,
            })
            .then((res: any) => {
              let arr1 = [...replyAnswers];
              arr1[index] = res.data.data.data;
              setReplyAnswers(arr1);
            });
        }
      })
      .catch((e: any) => {
        setCommentLoading(false);
      });
  };

  return (
    <>
      <div className={styles["content"]}>
        <div className={styles["navheader"]}>
          <div className={styles["top"]}>
            <div className={styles["top-left"]}>
              <img
                onClick={() => goDetail()}
                className={styles["icon-back"]}
                src={backIcon}
              />
              <span onClick={() => goDetail()}>{book.name}</span>
            </div>
            <div className={styles["top-right"]}>
              <div className={styles["button"]} onClick={() => showIndex()}>
                {indexText}
              </div>
              {prevId !== 0 && (
                <div
                  className={styles["button"]}
                  onClick={() => switchArticle(prevId)}
                >
                  上一节
                </div>
              )}
              {nextId !== 0 && (
                <div
                  className={styles["button"]}
                  onClick={() => switchArticle2(nextId)}
                >
                  下一节
                </div>
              )}
            </div>
          </div>
        </div>
        <div className={styles["read-box"]}>
          {indexStaus && (
            <div className={styles["left-box"]}>
              <div className={styles["chapter-list-box"]}>
                {chapters.length > 0 &&
                  chapters.map((chapterItem: any) => (
                    <div className={styles["chapter"]} key={chapterItem.id}>
                      <div className={styles["title"]}>{chapterItem.name}</div>
                      {articles[chapterItem.id] &&
                        articles[chapterItem.id].length > 0 && (
                          <div className={styles["chapter-articles-box"]}>
                            {articles[chapterItem.id].map(
                              (articleItem: any) => (
                                <div
                                  key={articleItem.id}
                                  className={
                                    list.id === articleItem.id
                                      ? styles["act-article-item"]
                                      : styles["article-item"]
                                  }
                                  onClick={() => goRead(articleItem)}
                                >
                                  <div className={styles["video-title"]}>
                                    <div className={styles["text"]}>
                                      {articleItem.title}
                                    </div>
                                    {!isBuy &&
                                      book.charge > 0 &&
                                      articleItem.charge === 0 && (
                                        <div className={styles["free"]}>
                                          试读
                                        </div>
                                      )}
                                  </div>
                                </div>
                              )
                            )}
                          </div>
                        )}
                    </div>
                  ))}
                {chapters.length === 0 &&
                  articles[0] &&
                  articles[0].length > 0 && (
                    <div className={styles["chapter"]}>
                      <div className={styles["chapter-articles-box"]}>
                        {articles[0].map((articleItem: any) => (
                          <div
                            key={articleItem.id}
                            className={
                              list.id === articleItem.id
                                ? styles["act-article-item"]
                                : styles["article-item"]
                            }
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
            </div>
          )}
          <div className={styles["right-box"]}>
            {loading && (
              <div className={styles["read"]}>
                <Skeleton.Button
                  active
                  style={{
                    width: 806,
                    height: 48,
                    marginBottom: 30,
                  }}
                ></Skeleton.Button>
                <div className={styles["line"]}></div>
                <Skeleton active paragraph={{ rows: 3 }}></Skeleton>
              </div>
            )}
            {!loading && canSee && (
              <div className={styles["read"]}>
                <div className={styles["title"]}>{list.title}</div>
                <div className={styles["line"]}></div>
                <div
                  className="u-content md-content"
                  id="desc"
                  dangerouslySetInnerHTML={{ __html: list.render_content }}
                ></div>
              </div>
            )}
            {!loading && !canSee && isBuy === false && (
              <>
                <div className={styles["title"]}>{list.title}</div>
                {book.charge > 0 && (
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
                      className={styles["buy-button"]}
                      onClick={() => goRole()}
                    >
                      会员免费看
                    </div>
                  )}
              </>
            )}
          </div>
        </div>
        <div className={styles["book-comments-box"]}>
          <div
            className={
              indexStaus
                ? styles["active-book-comments"]
                : styles["book-comments"]
            }
          >
            {isLogin && canSee && (
              <div className={styles["replybox"]}>
                <div className={styles["reply"]}>
                  {user && (
                    <img className={styles["user-avatar"]} src={user.avatar} />
                  )}
                  <Input
                    className={styles["reply-input"]}
                    onChange={(e) => {
                      setContent(e.target.value);
                    }}
                    value={content}
                    placeholder="此处填写你的评论"
                  ></Input>
                  {content === "" && (
                    <Button
                      type="primary"
                      className={styles["disabled-button"]}
                    >
                      评论
                    </Button>
                  )}
                  {content !== "" && (
                    <Button
                      type="primary"
                      className={styles["btn-submit"]}
                      onClick={() => submitComment()}
                      loading={commentLoading}
                    >
                      评论
                    </Button>
                  )}
                </div>
              </div>
            )}
            <div className={styles["tit"]}>全部评论</div>
            <div className={styles["line"]}></div>
            <div className={styles["comments-list-box"]}>
              {comments.length === 0 && (
                <Col span={24}>
                  <Empty></Empty>
                </Col>
              )}
              {comments.length > 0 &&
                comments.map((item: any, index: number) => (
                  <div key={item.id} className={styles["comment-item"]}>
                    <div className={styles["avatar"]}>
                      {item.user.length !== 0 && <img src={item.user.avatar} />}
                      {item.user.length === 0 && <img src={defaultAvatar} />}
                    </div>
                    <div className={styles["comment-content"]}>
                      <div className={styles["top-info"]}>
                        {item.user.length === 0 && (
                          <div className={styles["nickname"]}>未知用户</div>
                        )}
                        {item.user.length !== 0 && (
                          <div className={styles["nickname"]}>
                            {item.user.nick_name}
                          </div>
                        )}
                        <div className={styles["diff"]}>
                          {getCommentTime(item.created_at)}
                        </div>
                      </div>
                      <div className={styles["text"]}>{item.content}</div>
                      <div className={styles["reply-answer-box"]}>
                        {canSee && item.user.length !== 0 && (
                          <div
                            className={
                              configInput[index] === true
                                ? styles["reply-trans-answer"]
                                : styles["reply-answer"]
                            }
                            onClick={() => showReply(item.id)}
                          >
                            回复
                          </div>
                        )}
                        {item.children_count !== 0 && (
                          <div
                            className={
                              configkey[index] === true
                                ? styles["reply-trans-answer"]
                                : styles["reply-answer"]
                            }
                            onClick={() => getAnswer(index, item.id)}
                          >
                            {item.children_count}回复
                          </div>
                        )}
                      </div>
                      {configInput[item.id] === true && (
                        <div className={styles["one-class-replybox"]}>
                          <Input
                            className={styles["input-box"]}
                            value={replyContent}
                            onChange={(e) => {
                              setReplyContent(e.target.value);
                            }}
                            placeholder={"回复" + item.user.nick_name}
                          ></Input>
                          {replyContent === "" && (
                            <Button
                              type="primary"
                              className={styles["disabled-button"]}
                            >
                              发表回复
                            </Button>
                          )}
                          {replyContent !== "" && (
                            <Button
                              type="primary"
                              className={styles["confirm-button"]}
                              onClick={() =>
                                reply(
                                  item.id,
                                  item.reply_id,
                                  item.user.nick_name,
                                  index
                                )
                              }
                              loading={commentLoading}
                            >
                              发表回复
                            </Button>
                          )}
                        </div>
                      )}
                      {configkey[index] === true && (
                        <div className={styles["reply-list-box"]}>
                          {replyAnswers.length > 0 &&
                            replyAnswers[index] &&
                            replyAnswers[index].map((replyItem: any) => (
                              <div
                                key={replyItem.id}
                                className={styles["reply-list-item"]}
                              >
                                <div className={styles["reply-avatar"]}>
                                  {replyItem.user.length !== 0 && (
                                    <img src={replyItem.user.avatar} />
                                  )}
                                  {replyItem.user.length === 0 && (
                                    <img src={defaultAvatar} />
                                  )}
                                </div>
                                <div className={styles["reply-content"]}>
                                  <div className={styles["top-info"]}>
                                    {replyItem.user.length === 0 && (
                                      <div
                                        className={styles["red-reply-nickname"]}
                                      >
                                        未知用户
                                      </div>
                                    )}
                                    {replyItem.user.length !== 0 && (
                                      <div className={styles["reply-nickname"]}>
                                        <>
                                          {replyItem.user.nick_name}
                                          {replyItem.reply != null && (
                                            <>
                                              回复：
                                              {replyItem.reply.user.nick_name}
                                            </>
                                          )}
                                        </>
                                      </div>
                                    )}
                                    <div className={styles["reply-diff"]}>
                                      {getCommentTime(replyItem.created_at)}
                                    </div>
                                  </div>
                                  <div className={styles["reply-text"]}>
                                    {replyItem.content}
                                  </div>
                                  {replyItem.user.length !== 0 && (
                                    <div
                                      className={styles["answer-item"]}
                                      onClick={() => showReply(replyItem.id)}
                                    >
                                      回复
                                    </div>
                                  )}
                                  {configInput[replyItem.id] === true && (
                                    <div
                                      className={styles["Two-class-replybox"]}
                                    >
                                      <Input
                                        className={styles["input-box"]}
                                        value={replyContent}
                                        onChange={(e) => {
                                          setReplyContent(e.target.value);
                                        }}
                                        placeholder={
                                          "回复" + replyItem.user.nick_name
                                        }
                                      ></Input>
                                      {replyContent === "" && (
                                        <Button
                                          type="primary"
                                          className={styles["disabled-button"]}
                                        >
                                          发表回复
                                        </Button>
                                      )}
                                      {replyContent !== "" && (
                                        <Button
                                          type="primary"
                                          className={styles["confirm-button"]}
                                          onClick={() =>
                                            reply(
                                              item.id,
                                              replyItem.id,
                                              replyItem.user.nick_name,
                                              index
                                            )
                                          }
                                          loading={commentLoading}
                                        >
                                          发表回复
                                        </Button>
                                      )}
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default BookReadPage;
