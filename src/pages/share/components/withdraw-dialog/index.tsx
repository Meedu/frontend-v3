import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { Input, message, Select } from "antd";
import styles from "./index.module.scss";
import { multiLevelShare } from "../../../../api/index";
import closeIcon from "../../../../assets/img/commen/icon-close.png";

interface PropInterface {
  open: boolean;
  balance: number;
  onSuccess: () => void;
  onCancel: () => void;
}

export const WithdrawDialog: React.FC<PropInterface> = ({
  open,
  balance,
  onSuccess,
  onCancel,
}) => {
  const [loading, setLoading] = useState(false);
  const [channelName, setChannelName] = useState("");
  const [channelAccount, setChannelAccount] = useState("");
  const [amount, setAmount] = useState(0);
  const [channel, setChannel] = useState("alipay");
  const [channelAddress, setChannelAddress] = useState("");
  const channels = [
    {
      label: "支付宝",
      value: "alipay",
    },
    // {
    //   label: "微信",
    //   value: "wechat",
    // },
  ];

  useEffect(() => {
    if (open) {
      setChannelAccount("");
      setChannelName("");
      setAmount(0);
      setChannel("alipay");
      setChannelAddress("");
    }
  }, [open]);

  const submit = () => {
    if (loading) {
      return;
    }
    if (channelAccount === "") {
      message.error("请输入支付宝账户");
      return;
    }
    if (channelName === "") {
      message.error("请输入真实姓名");
      return;
    }
    if (!amount) {
      message.error("请输入提现金额");
      return;
    }
    if (amount > balance) {
      message.error("提现金额不得大于余额");
      return;
    }
    if (amount <= 0) {
      message.error("提现金额需要大于0");
      return;
    }
    setLoading(true);
    multiLevelShare
      .withdraw({
        channel_account: channelAccount,
        channel_name: channelName,
        amount: amount,
        channel: channel,
        channel_address: channelAddress,
      })
      .then(() => {
        message.success("提现申请已提交，请耐心等待管理员转账");
        onSuccess();
        setLoading(false);
      });
  };

  return (
    <>
      {open && (
        <div className={styles["mask"]}>
          <div className={styles["dialog-box"]}>
            <div className={styles["dialog-tabs"]}>
              <div className={styles["item-tab"]}>申请提现</div>
              <img
                className={styles["btn-close"]}
                onClick={() => onCancel()}
                src={closeIcon}
              />
            </div>
            <div className={styles["info"]}>
              <div className={styles["item"]}>
                <div className={styles["tit"]}>
                  <span>*</span>提现渠道
                </div>
                <Select
                  size="large"
                  allowClear
                  style={{
                    flex: 1,
                    height: 40,
                    borderRadius: 4,
                    borderColor: "#dcdfe6",
                    outline: "none",
                    fontSize: 14,
                    color: "#333333",
                    textAlign: "left",
                  }}
                  value={channel}
                  onChange={(value: any) => {
                    setChannel(value);
                  }}
                  placeholder="请选择"
                  options={channels}
                ></Select>
              </div>

              {channel === "alipay" ? (
                <div className={styles["item"]}>
                  <div className={styles["tit"]}>
                    <span>*</span>提现账号
                  </div>
                  <Input
                    value={channelAccount}
                    onChange={(e) => {
                      setChannelAccount(e.target.value);
                    }}
                    className={styles["input"]}
                    placeholder="收款账号"
                  ></Input>
                </div>
              ) : null}

              <div className={styles["item"]}>
                <div className={styles["tit"]}>
                  <span>*</span>真实姓名
                </div>
                <Input
                  value={channelName}
                  onChange={(e) => {
                    setChannelName(e.target.value);
                  }}
                  className={styles["input"]}
                  placeholder="真实姓名"
                ></Input>
              </div>
              <div className={styles["item"]}>
                <div className={styles["tit"]}>
                  <span>*</span>提现金额
                </div>
                <Input
                  type="number"
                  value={amount}
                  onChange={(e: any) => {
                    setAmount(e.target.value);
                  }}
                  className={styles["input"]}
                  placeholder="提现金额"
                  min={0}
                ></Input>
              </div>
            </div>
            <div className={styles["btn-box"]}>
              <div className={styles["btn-submit"]} onClick={() => submit()}>
                申请提现
              </div>
              <div className={styles["btn-cancel"]} onClick={() => onCancel()}>
                取消
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
