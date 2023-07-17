import React, { useState, useEffect } from "react";
import { Row, Col, Spin, Pagination, Input, Button, message } from "antd";
import styles from "./index.module.scss";
import { useNavigate } from "react-router-dom";
import { NavMember, Empty } from "../../../components";
import { RecordsDialog } from "./components/records";
import { VerifyDialog } from "./components/verify-dialog";
import { ConfirmDialog } from "./components/confirm-dialog";
import { user as member } from "../../../api/index";
import { changeTime } from "../../../utils/index";

const MemberExchangerPage = () => {
  document.title = "兑换课程";
  const navigate = useNavigate();
  const [loading, setLoading] = useState<boolean>(false);
  const [list, setList] = useState<any>([]);
  const [refresh, setRefresh] = useState(false);
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [relateData, setRelateData] = useState<any>([]);
  const [recordsVisiable, setRecordsVisiable] = useState<boolean>(false);
  const [verifyVisiable, setVerifyVisiable] = useState<boolean>(false);
  const [ischecked, setIschecked] = useState<boolean>(false);
  const [exchangeCode, setExchangeCode] = useState<string>("");
  const [queryList, setQueryList] = useState<any>([]);
  const [buttonStatus, setButtonStatus] = useState<boolean>(false);
  const [confirmStatus, setConfirmStatus] = useState<boolean>(false);

  useEffect(() => {
    getData();
  }, [page, size, refresh]);

  const getData = () => {
    if (loading) {
      return;
    }
    setLoading(true);
    member
      .codeExchangerRecords({ page: page, page_size: size })
      .then((res: any) => {
        setList(res.data.data);
        setTotal(res.data.total);
        setLoading(false);
      });
  };

  const showDetail = (data: any) => {
    setRelateData(data);
    setRecordsVisiable(true);
  };

  const resetData = () => {
    setPage(1);
    setList([]);
    setRefresh(!refresh);
  };

  const exchange = () => {
    if (!exchangeCode) {
      message.error("请输入兑换码");
      return;
    }
    setIschecked(false);
    setVerifyVisiable(true);
  };

  return (
    <div className="container">
      <RecordsDialog
        relateData={relateData}
        open={recordsVisiable}
        onCancel={() => setRecordsVisiable(false)}
      ></RecordsDialog>
      <VerifyDialog
        status={ischecked}
        exchangeCode={exchangeCode}
        open={verifyVisiable}
        onSuccess={() => {
          setExchangeCode("");
          setVerifyVisiable(false);
          resetData();
        }}
        checkSuccess={(data: any, status: boolean) => {
          setVerifyVisiable(false);
          setQueryList(data);
          setButtonStatus(status);
          setConfirmStatus(true);
        }}
        onCancel={() => setVerifyVisiable(false)}
      ></VerifyDialog>
      <ConfirmDialog
        data={queryList}
        buttonStatus={buttonStatus}
        open={confirmStatus}
        onSubmit={() => {
          setConfirmStatus(false);
          setIschecked(true);
          setVerifyVisiable(true);
        }}
        onCancel={() => setConfirmStatus(false)}
      ></ConfirmDialog>
      <div className={styles["box"]}>
        <NavMember cid={15} refresh={true}></NavMember>
        <div className={styles["right-box"]}>
          <div className={styles["exchange-box"]}>
            <div className={styles["tit"]}>兑换码</div>
            <Input
              value={exchangeCode}
              onChange={(e) => {
                setExchangeCode(e.target.value);
              }}
              className={styles["input"]}
              placeholder="请输入兑换码"
            ></Input>
            <Button
              type="primary"
              className={styles["btn-exchange"]}
              onClick={() => exchange()}
            >
              验证
            </Button>
          </div>
          <div className={styles["project-box"]}>
            <div className={styles["btn-title"]}>兑换记录</div>
            {loading && (
              <Row>
                <div className="float-left d-j-flex mt-50">
                  <Spin size="large" />
                </div>
              </Row>
            )}
            {!loading && list.length === 0 && (
              <Col span={24}>
                <Empty></Empty>
              </Col>
            )}
            {!loading && list.length > 0 && (
              <>
                {list.map((item: any) => (
                  <div
                    key={item.activity_id}
                    className={styles["project-item"]}
                    onClick={() =>
                      showDetail(JSON.parse(item.activity.relate_data))
                    }
                  >
                    <div className={styles["title"]}>{item.activity.name}</div>
                    <div className={styles["info"]}>
                      <span>{changeTime(item.used_at)}</span>
                    </div>
                  </div>
                ))}
              </>
            )}
            {!loading && list.length > 0 && size < total && (
              <Col
                span={24}
                style={{
                  display: "flex",
                  justifyContent: "center",
                  marginTop: 50,
                  marginBottom: 30,
                }}
              >
                <Pagination
                  onChange={(currentPage) => {
                    setPage(currentPage);
                    window.scrollTo(0, 0);
                  }}
                  pageSize={size}
                  defaultCurrent={page}
                  total={total}
                />
              </Col>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MemberExchangerPage;
