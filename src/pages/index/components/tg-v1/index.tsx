import React from "react";
import { message } from "antd";
import styles from "./index.module.scss";
import { ThumbBar } from "../../../../components";
import { useNavigate } from "react-router-dom";

interface PropInterface {
  items: any;
  name: string;
}

export const TuangouComp: React.FC<PropInterface> = ({ items, name }) => {
  const navigate = useNavigate();
  const goDetail = (item: any) => {
    if (item.is_over) {
      message.error("已结束");
      return;
    }
    if (item.goods_type === "course") {
      navigate("/courses/detail/" + item.other_id);
    } else if (item.goods_type === "live") {
      navigate("/live/detail/" + item.other_id);
    } else if (item.goods_type === "book") {
      navigate("/book/detail/" + item.other_id);
    } else if (item.goods_type === "learnPath") {
      navigate("/learnPath/detail/" + item.other_id);
    }
  };

  return (
    <>
      {items.length > 0 && (
        <div className={styles["index-section-box"]}>
          <div className={styles["index-section-title"]}>
            <div className={styles["index-section-title-text"]}>{name}</div>
          </div>
          <div className={styles["index-section-body"]}>
            {items.map((item: any, index: number) => (
              <div
                className={styles["tg-course-item"]}
                key={item.id + "tg" + index}
                onClick={() => goDetail(item)}
              >
                {!item.goods_type && (
                  <div className={styles["whiteback"]}></div>
                )}
                <div className={styles["tg-course-thumb"]}>
                  {item.goods_type === "book" && (
                    <div className={styles["thumb-bar"]}>
                      <ThumbBar
                        value={item.goods_thumb}
                        width={148.5}
                        height={198}
                        border={8}
                      />
                    </div>
                  )}
                  {item.goods_type !== "book" && (
                    <div className={styles["thumb-bar"]}>
                      <ThumbBar
                        value={item.goods_thumb}
                        width={264}
                        height={198}
                        border={8}
                      />
                    </div>
                  )}
                </div>
                <div className={styles["tg-course-body"]}>
                  <div className={styles["tg-course-title"]}>
                    {item.goods_title}
                  </div>
                  <div className={styles["tg-course-info"]}>
                    <div className={styles["tg-course-charge"]}>
                      <span className={styles["charge-text"]}>
                        <span className={styles["unit"]}>￥</span>
                        {item.charge}
                      </span>
                    </div>
                    <div className={styles["original_charge"]}>
                      原价：{item.original_charge}
                    </div>
                  </div>
                  {item.is_over && (
                    <div className={styles["over-progress"]}>已结束</div>
                  )}
                  {!item.is_over && (
                    <div className={styles["tg-progress"]}>
                      <div className={styles["label"]}>立即抢购</div>
                      <div className={styles["progress-text"]}>
                        {item.people_num}人团
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
};
