import React, { useState } from "react";
import { message } from "antd";
import styles from "./index.module.scss";
import { sign } from "../../api/index";
import signIcon from "../../assets/img/commen/icon-sign-n.png";

interface PropInterface {
  open: boolean;
  success: () => void;
}

export const SignComp: React.FC<PropInterface> = ({ open, success }) => {
  const [loading, setLoading] = useState<boolean>(false);

  const goSign = () => {
    if (loading) {
      return;
    }
    setLoading(true);
    sign
      .signIn({})
      .then((res: any) => {
        setLoading(false);
        if (res.data.reward === false) {
          message.success(`今日已签到`);
        } else {
          message.success("签到成功，积分+" + res.data.reward);
        }
        success();
      })
      .catch((e: any) => {
        message.error(e.message || JSON.stringify(e));
        setLoading(false);
      });
  };

  return (
    <>
      {open && (
        <div className={styles["backTop"]} onClick={() => goSign()}>
          <img src={signIcon} />
          <span>签到</span>
        </div>
      )}
    </>
  );
};
