import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Input, Upload, message, Button } from "antd";
import type { UploadProps } from "antd";
import styles from "./index.module.scss";
import { wenda, user as member } from "../../api/index";
import closeIcon from "../../assets/img/commen/icon-close.png";
import config from "../../js/config";
import uploadIcon from "../../assets/img/commen/upload.png";
import { loginAction } from "../../store/user/loginUserSlice";
import { getToken } from "../../utils/index";

interface PropInterface {
  open: boolean;
  enable: boolean;
  onSuccess: (id: number, value: number) => void;
  onCancel: () => void;
}

export const CreateQuestionDialog: React.FC<PropInterface> = ({
  open,
  enable,
  onSuccess,
  onCancel,
}) => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState<boolean>(false);
  const [categories, setCategories] = useState<any>([]);
  const [title, setTitle] = useState<string>("");
  const [credit1, setCredit1] = useState<any>(null);
  const [categoryId, setCategoryId] = useState(0);
  const [content, setContent] = useState<string>("");
  const [thumbs, setThumbs] = useState<any>([]);
  const user = useSelector((state: any) => state.loginUser.value.user);

  useEffect(() => {
    if (open) {
      setTitle("");
      setCredit1(null);
      setThumbs([]);
      setCategoryId(0);
      setContent("");
      getCreateParams();
      getUser();
    }
  }, [open]);

  const getUser = () => {
    member.detail().then((res: any) => {
      let loginData = res.data;
      dispatch(loginAction(loginData));
    });
  };

  const getCreateParams = () => {
    wenda.create().then((res: any) => {
      setCategories(res.data.categories);
    });
  };

  const props: UploadProps = {
    name: "file",
    multiple: false,
    method: "POST",
    action: config.app_url + "/api/v2/upload/image",
    headers: {
      Accept: "application/json",
      authorization: "Bearer " + getToken(),
    },
    beforeUpload: (file) => {
      const isPNG =
        file.type === "image/png" ||
        file.type === "image/jpg" ||
        file.type === "image/jpeg";

      if (!isPNG) {
        message.error(`${file.name}不是图片文件`);
      }
      const isLt2M = file.size / 1024 / 1024 < 2;
      if (!isLt2M) {
        message.error("图片大小不超过2M");
      }
      return (isPNG && isLt2M) || Upload.LIST_IGNORE;
    },
    onChange(info: any) {
      const { status, response } = info.file;
      if (status === "done") {
        if (response.code === 0) {
          message.success("上传成功");
          let url = response.data.url;
          let arr = [...thumbs];
          arr.push(url);
          setThumbs(arr);
        } else {
          message.error(response.msg);
        }
      } else if (status === "error") {
        message.error(`${info.file.name} 上传失败`);
      }
    },
  };

  const submit = () => {
    if (loading) {
      return;
    }
    if (categoryId === 0) {
      message.error("请选择问题分类");
      return;
    }
    if (title === "") {
      message.error("请填写问题标题");
      return;
    }
    if (content === "") {
      message.error("请填写问题具体内容");
      return;
    }
    let key = Math.floor(credit1);
    if (key > 0 && key > user.credit1) {
      message.error("积分余额不足");
      return;
    }
    setLoading(true);
    wenda
      .store({
        title: title,
        category_id: categoryId,
        original_content: content,
        render_content: content,
        images: thumbs,
        credit1: credit1,
      })
      .then((res: any) => {
        message.success("发布成功");
        setLoading(false);
        onSuccess(res.data.id, credit1 || 0);
      })
      .catch((e) => {
        setLoading(false);
      });
  };

  return (
    <>
      {open && (
        <div className={styles["mask"]}>
          <div className={styles["dialog-box"]}>
            <div className={styles["tabs"]}>
              <div className={styles["tit"]}>
                问题分类<span className={styles["notice_article_type"]}>*</span>
              </div>
              <img
                className={styles["btn-close"]}
                onClick={() => onCancel()}
                src={closeIcon}
              />
            </div>
            <div className={styles["qa-group-input-box"]}>
              <div className={styles["qa-group-item"]}>
                <div className={styles["body-wrap"]}>
                  {categories.map((item: any) => (
                    <div
                      key={item.id}
                      className={
                        item.id === categoryId
                          ? styles["active-category"]
                          : styles["category"]
                      }
                      onClick={() => setCategoryId(item.id)}
                    >
                      {item.name}
                    </div>
                  ))}
                </div>
              </div>
              <div className={styles["qa-group-item"]}>
                <div className={styles["body"]}>
                  <div className={styles["title"]}>
                    问题标题
                    <span className={styles["notice_article_type"]}>*</span>
                  </div>
                  <Input
                    value={title}
                    onChange={(e) => {
                      setTitle(e.target.value);
                    }}
                    className={styles["input"]}
                    maxLength={64}
                    placeholder="请填写问题标题（不超过64个字）"
                  ></Input>
                </div>
              </div>
              <div className={styles["qa-group-item"]}>
                <div className={styles["body"]}>
                  <div className={styles["title"]}>
                    问题内容
                    <span className={styles["notice_article_type"]}>*</span>
                  </div>
                  <Input.TextArea
                    value={content}
                    onChange={(e) => {
                      setContent(e.target.value);
                    }}
                    className={styles["textarea"]}
                    placeholder="请填写问题具体内容"
                  ></Input.TextArea>
                </div>
              </div>
              <div className={styles["qa-group-item"]}>
                <div className={styles["body"]}>
                  <div className={styles["title"]}>插入图片</div>
                  <div className={styles["img-wrap"]}>
                    <Upload {...props} showUploadList={false}>
                      <div className={styles["btn-upload-image"]}>
                        <img src={uploadIcon} />
                      </div>
                    </Upload>
                    {thumbs.length > 0 &&
                      thumbs.map((imgItem: any, index: number) => (
                        <div key={index} className={styles["img-item"]}>
                          <img src={imgItem} />
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </div>
            <div className={styles["bottom-item"]}>
              <div className={styles["body"]}>
                {enable && <div className={styles["title"]}>悬赏积分</div>}
                <div className={styles["credit1"]}>
                  {enable && (
                    <>
                      <Input
                        type="number"
                        value={credit1}
                        onChange={(e) => {
                          setCredit1(e.target.value);
                        }}
                        className={styles["input2"]}
                        placeholder="置悬赏积分"
                      ></Input>
                      <div className={styles["help"]}>
                        积分余额：{user.credit1}积分
                      </div>
                    </>
                  )}
                  {content.length > 0 && title.length > 0 && categoryId > 0 ? (
                    <Button
                      loading={loading}
                      className={styles["active-confirm-button"]}
                      onClick={() => submit()}
                    >
                      发布问题
                    </Button>
                  ) : (
                    <div className={styles["confirm-button"]}>发布问题</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
