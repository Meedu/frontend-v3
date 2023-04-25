import React, { useState, useEffect } from "react";
import styles from "./detail.module.scss";
import { Row, Col, Spin, Pagination, Input, Button, message } from "antd";
import { useSelector } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import { wenda } from "../../api/index";
import { ImagePreview, UploadWendaImagesComp, Empty } from "../../components";
import { changeTime, getCommentTime } from "../../utils/index";
import questionIcon from "../../assets/img/commen/icon-question.png";
import defaultAvatar from "../../assets/img/commen/default-avatar.jpg";
import idoptIcon from "../../assets/img/commen/icon-adopt.png";
import likeIcon from "../../assets/img/commen/icon-like-h.png";
import noLikeIcon from "../../assets/img/commen/icon-like.png";

export const WendaDetailPage = () => {
  const navigate = useNavigate();
  const result = new URLSearchParams(useLocation().search);
  const [loading, setLoading] = useState<boolean>(false);
  const [question, setQuestion] = useState<any>({});
  const [answers, setAnswers] = useState<any>([]);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isVote, setIsVote] = useState<boolean>(false);
  const [images, setImages] = useState<any>([]);
  const [isUploadShow, setIsUploadShow] = useState<boolean>(true);
  const [preVisiable, setPreVisiable] = useState<boolean>(false);
  const [imgSrc, setImgSrc] = useState<string>("");
  const [content, setContent] = useState<string>("");
  const [configkey, setConfigkey] = useState<any>([]);
  const [replyContent, setReplyContent] = useState<string>("");
  const [replyAnswers, setReplyAnswers] = useState<any>([]);
  const [commentId, setCommentId] = useState<number>(0);
  const [answerId, setAnswerId] = useState(0);
  const [configInput, setConfigInput] = useState<any>([]);
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(10000);
  const [total, setTotal] = useState(0);
  const [id, setId] = useState(Number(result.get("id")));
  const user = useSelector((state: any) => state.loginUser.value.user);
  const isLogin = useSelector((state: any) => state.loginUser.value.isLogin);

  useEffect(() => {
    getData();
  }, [id]);

  const getData = () => {
    if (loading) {
      return;
    }
    setLoading(true);
    wenda.detail(id).then((res: any) => {
      document.title = res.data.question.title;
      setQuestion(res.data.question);
      setAnswers(res.data.answers);
      setIsAdmin(res.data.is_admin);
      setIsVote(res.data.is_vote);
      setLoading(false);
    });
  };

  const submitComment = () => {
    if (content === "") {
      return;
    }
    wenda
      .submitAnswer(id, {
        original_content: content,
        render_content: content,
        images: images,
      })
      .then((res: any) => {
        setContent("");
        message.success("评论成功");
        getData();
      });
  };

  const questionVote = (answerItem: any, index: number) => {
    if (!isLogin) {
      goLogin();
      return;
    }
    if (!answerItem.user) {
      return;
    }
    wenda
      .vote({
        id: answerItem.id,
        type: 1,
      })
      .then((res: any) => {
        let value = res.data.ok === 1;
        setIsVote(value);
        if (answerItem.is_vote === 1) {
          let data = [...answers];
          data[index].vote_count--;
          data[index].is_vote = 0;
          setAnswers(data);
          message.success("取消点赞");
        } else {
          let data = [...answers];
          data[index].vote_count++;
          data[index].is_vote = 1;
          setAnswers(data);
          message.success("已点赞");
        }
      });
  };

  const showReply = (id: number) => {
    if (!isLogin) {
      goLogin();
      return;
    }
    let arr = [...configInput];
    arr[id] = true;
    setConfigInput(arr);
  };

  const getAnswer = (index: number, id: number) => {
    if (id === 0) {
      return;
    }
    let keys = [...configkey];
    keys[index] = !keys[index];
    setConfigkey(keys);
    setCommentId(id);
    wenda
      .answerComments(id, {
        page: page,
        page_size: size,
      })
      .then((res: any) => {
        let arr1 = [...replyAnswers];
        arr1[index] = res.data.data.data;
        setReplyAnswers(arr1);
      });
  };
  const reply = (id: number, userId: any, nick_name: string, index: number) => {
    if (!nick_name) {
      message.error("回复的用户不存在");
      return;
    }
    if (!replyContent) {
      return;
    }
    setAnswerId(id);
    wenda
      .submitComment(id, {
        original_content: replyContent,
        render_content: replyContent,
        reply_user_id: userId,
      })
      .then((res: any) => {
        setConfigInput([]);
        message.success("回复成功");
        let item;
        if (userId) {
          item = {
            id: res.data.comment_id,
            parent_id: id,
            render_content: replyContent,
            children_count: 0,
            reply_comment: {
              user: { nick_name: nick_name },
            },
            created_at: "刚刚",
            user: {
              avatar: user.avatar,
              nick_name: user.nick_name,
            },
          };
        } else {
          item = {
            id: res.data.comment_id,
            parent_id: id,
            render_content: replyContent,
            children_count: 0,
            reply_comment: null,
            created_at: "刚刚",
            user: {
              avatar: user.avatar,
              nick_name: user.nick_name,
            },
          };
        }
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
        setReplyContent("");
      });
  };

  const goLogin = () => {
    navigate("/login");
  };

  const setCorrect = (answer: any) => {
    if (!answer.user) {
      return;
    }
    wenda
      .choiceAnswer(question.id, {
        answer_id: answer.id,
      })
      .then(() => {
        message.success("成功");
        getData();
      });
  };

  return (
    <>
      <div className="container">
        <div className="bread-nav">
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
              navigate("/wenda");
            }}
          >
            问答社区
          </a>{" "}
          /<span>{question.title}</span>
        </div>
        {preVisiable && (
          <ImagePreview
            url={imgSrc}
            close={() => setPreVisiable(false)}
          ></ImagePreview>
        )}
        <div className={styles["question-body"]}>
          {question.credit1 > 0 && (
            <div className={styles["credit"]}>悬赏：{question.credit1}积分</div>
          )}
          <div className={styles["title"]}>
            <div className={styles["icon"]}>
              <img src={questionIcon} />
            </div>
            <div className={styles["tit"]}>{question.title}</div>
          </div>
          <div className={styles["question-content"]}>
            <div
              dangerouslySetInnerHTML={{ __html: question.render_content }}
            ></div>
          </div>
          {question.images_list && question.images_list.length > 0 && (
            <div className={styles["thumbs-box"]}>
              {question.images_list.map((imgItem: any, index: number) => (
                <div key={index} className={styles["thumb-item"]}>
                  <div
                    className={styles["image-view"]}
                    style={{ backgroundImage: "url(" + imgItem + ")" }}
                    onClick={() => {
                      setImgSrc(imgItem);
                      setPreVisiable(true);
                    }}
                  ></div>
                </div>
              ))}
            </div>
          )}
          <div className={styles["stat"]}>
            <span className={styles["datetime"]}>
              {changeTime(question.created_at)}
            </span>
            <span className={styles["view-times"]}>
              {question.view_times}次浏览
            </span>
            <span className={styles["answer-count"]}>
              {question.answer_count}回答
            </span>
          </div>
        </div>
        <div className={styles["comments-box"]}>
          {isLogin && question.status !== 1 && (
            <div className={styles["reply-box"]}>
              {user && (
                <div className={styles["avatar"]}>
                  <img src={user.avatar} />
                </div>
              )}
              <Input
                className={styles["input-box"]}
                onChange={(e) => {
                  setContent(e.target.value);
                }}
                value={content}
                placeholder="此处填写你的回答"
              ></Input>
              {content === "" && (
                <Button className={styles["disabled-button"]}>发布回答</Button>
              )}
              {content !== "" && (
                <Button
                  className={styles["confirm-button"]}
                  onClick={() => submitComment()}
                >
                  发布回答
                </Button>
              )}
              <div className={styles["upload-body"]}>
                <UploadWendaImagesComp
                  open={isUploadShow}
                  onUpdate={(thumbs: any[]) => {
                    setImages(thumbs);
                  }}
                ></UploadWendaImagesComp>
              </div>
            </div>
          )}
          <div className={styles["comment-divider"]}>全部回答</div>
          <div className={styles["line"]}></div>
          <div className={styles["comments-list-box"]}>
            {answers.length === 0 && (
              <Col span={24}>
                <Empty></Empty>
              </Col>
            )}
            {answers.length > 0 &&
              answers.map((item: any, index: number) => (
                <div className={styles["comment-item"]} key={item.id}>
                  <div className={styles["avatar"]}>
                    {item.user && <img src={item.user.avatar} />}
                    {!item.user && <img src={defaultAvatar} />}
                  </div>
                  <div className={styles["comment-content"]}>
                    <div className={styles["top-info"]}>
                      {!item.user && (
                        <div className={styles["nickname"]}>未知用户</div>
                      )}
                      {item.user && (
                        <div className={styles["nickname"]}>
                          {item.user.nick_name}
                        </div>
                      )}
                      <div className={styles["diff"]}>
                        {getCommentTime(item.created_at)}
                      </div>
                      {item.is_correct === 1 && (
                        <div className={styles["correct-answer"]}>
                          <img src={idoptIcon} />
                          此回答已被题主采纳
                        </div>
                      )}
                    </div>
                    <div
                      className={styles["text"]}
                      dangerouslySetInnerHTML={{ __html: item.render_content }}
                    ></div>
                    {item.images_list.length > 0 && (
                      <div className={styles["thumbs"]}>
                        {item.images_list.map((imgItem: any, index: number) => (
                          <div key={index} className={styles["img-item"]}>
                            <div
                              className={styles["image-view"]}
                              style={{
                                backgroundImage: "url(" + imgItem + ")",
                              }}
                              onClick={() => {
                                setImgSrc(imgItem);
                                setPreVisiable(true);
                              }}
                            ></div>
                          </div>
                        ))}
                      </div>
                    )}
                    <div className={styles["reply-answer-box"]}>
                      <div
                        className={
                          item.is_vote === 1
                            ? styles["act-vote-button"]
                            : styles["vote-button"]
                        }
                        onClick={() => questionVote(item, index)}
                      >
                        {item.is_vote === 1 && <img src={likeIcon} />}
                        {item.is_vote !== 1 && <img src={noLikeIcon} />}
                        {item.vote_count}
                      </div>
                      {item.reply_count !== 0 && (
                        <div
                          className={
                            configkey[index] === true
                              ? styles["reply-trans-answer"]
                              : styles["reply-answer"]
                          }
                          onClick={() => getAnswer(index, item.id)}
                        >
                          {item.reply_count}回复
                        </div>
                      )}
                      {item.reply_count === 0 && item.user && (
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
                      {(configkey[index] === true ||
                        configInput[index] === true) && (
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
                            <Button className={styles["disabled-button"]}>
                              发表回复
                            </Button>
                          )}
                          {replyContent !== "" && (
                            <Button
                              className={styles["confirm-button"]}
                              onClick={() =>
                                reply(item.id, 0, item.user.nick_name, index)
                              }
                            >
                              发表回复
                            </Button>
                          )}
                        </div>
                      )}
                      {configkey[index] === true && (
                        <div className={styles["reply-list-box"]}>
                          {replyAnswers.length > 0 &&
                            replyAnswers[index].map((replyItem: any) => (
                              <div
                                key={replyItem.id}
                                className={styles["reply-list-item"]}
                              >
                                <div className={styles["reply-avatar"]}>
                                  {replyItem.user && (
                                    <img src={replyItem.user.avatar} />
                                  )}
                                  {!replyItem.user && (
                                    <img src={defaultAvatar} />
                                  )}
                                </div>
                                <div className={styles["reply-content"]}>
                                  <div className={styles["top-info"]}>
                                    {!replyItem.user && (
                                      <div
                                        className={styles["red-reply-nickname"]}
                                      >
                                        未知用户
                                      </div>
                                    )}
                                    {replyItem.user && (
                                      <div className={styles["reply-nickname"]}>
                                        <>
                                          {replyItem.user.nick_name}
                                          {replyItem.reply_user_id > 0 && (
                                            <>
                                              回复：
                                              {replyItem.reply_user.nick_name}
                                            </>
                                          )}
                                        </>
                                      </div>
                                    )}
                                    <div className={styles["reply-diff"]}>
                                      {getCommentTime(replyItem.created_at)}
                                    </div>
                                    <div
                                      className={styles["reply-text"]}
                                      dangerouslySetInnerHTML={{
                                        __html: replyItem.render_content,
                                      }}
                                    ></div>
                                  </div>
                                </div>
                              </div>
                            ))}
                        </div>
                      )}
                    </div>
                    {question.status === 0 && isAdmin && (
                      <div
                        className={styles["set-correct"]}
                        onClick={() => setCorrect(item)}
                      >
                        采纳此回答
                      </div>
                    )}
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </>
  );
};