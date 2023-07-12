import React, { useState, useEffect } from "react";
import { Input, Select, message } from "antd";
import { useDispatch } from "react-redux";
import styles from "./index.module.scss";
import { setNewAddress } from "../../../../../store/user/loginUserSlice";
import closeIcon from "../../../../../assets/img/commen/icon-close.png";
import CityData from "../../../../../js/address";

interface PropInterface {
  open: boolean;
  onCancel: () => void;
}

export const EditAddressDialog: React.FC<PropInterface> = ({
  open,
  onCancel,
}) => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState<boolean>(false);
  const [name, setName] = useState<string>("");
  const [mobile, setMobile] = useState<string>("");
  const [province, setProvince] = useState<any>(null);
  const [city, setCity] = useState<any>(null);
  const [area, setArea] = useState<any>(null);
  const [street, setStreet] = useState<string>("");
  const [provinceText, setProvinceText] = useState("");
  const [cityText, setCityText] = useState("");
  const [areaText, setAreaText] = useState("");
  const [provinceData, setProvinceData] = useState<any>([]);
  const [cityData, setCityData] = useState<any>([]);
  const [areaData, setAreaData] = useState<any>([]);
  useEffect(() => {
    if (open) {
      setName("");
      setMobile("");
      setProvince(null);
      setCity(null);
      setArea(null);
      setStreet("");
    }
  }, [open]);

  useEffect(() => {
    setProvinceData(CityData.data);
  }, [CityData]);

  useEffect(() => {
    for (var item in provinceData) {
      if (provinceData[item].value == province) {
        setCityData(provinceData[item].children);
      }
    }
  }, [province, provinceData]);

  useEffect(() => {
    for (var item in cityData) {
      if (cityData[item].value == city) {
        setAreaData(cityData[item].children);
      }
    }
  }, [city, cityData]);

  const submitValidate = () => {
    if (!name) {
      message.error("请填写收货人姓名");
      return;
    }
    if (!mobile) {
      message.error("请填写收货人手机号码");
      return;
    }
    if (!province) {
      message.error("请选择省");
      return;
    }
    if (!city) {
      message.error("请选择市");
      return;
    }
    if (!area) {
      message.error("请选择区");
      return;
    }
    if (!street) {
      message.error("请填写详细地址");
      return;
    }
    dispatch(
      setNewAddress({
        name: name,
        mobile: mobile,
        province: provinceText,
        city: cityText,
        area: areaText,
        street: street,
      })
    );
    onCancel();
  };

  return (
    <>
      {open && (
        <div className={styles["mask"]}>
          <div className={styles["dialog-login-box"]}>
            <div className={styles["dialog-tabs"]}>
              <div className={styles["item-tab"]}>收货人姓名</div>
              <img
                className={styles["btn-close"]}
                onClick={() => onCancel()}
                src={closeIcon}
              />
            </div>
            <div className={styles["box"]}>
              <div className={styles["input-item"]}>
                <Input
                  className={styles["input"]}
                  autoComplete="off"
                  placeholder="请填写收货人姓名"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                  }}
                />
              </div>
              <div className={styles["label"]}>收货人手机号</div>
              <div className={styles["input-item"]}>
                <Input
                  className={styles["input"]}
                  autoComplete="off"
                  placeholder="请填写收货人手机号码"
                  value={mobile}
                  onChange={(e) => {
                    setMobile(e.target.value);
                  }}
                />
              </div>
              <div className={styles["label"]}>收件地址</div>
              <div className={styles["input-item"]}>
                <Select
                  size="large"
                  allowClear
                  style={{
                    width: 150,
                    borderRadius: 4,
                    borderColor: "#cccccc",
                    outline: "none",
                    fontSize: 14,
                    color: "#333333",
                    textAlign: "left",
                    marginRight: 20,
                  }}
                  value={province}
                  onChange={(value: any) => {
                    setProvince(value);
                    let it = provinceData.find((it: any) => it.value === value);
                    if (it) {
                      setProvinceText(it.label);
                    }
                  }}
                  placeholder="请选择省"
                  options={provinceData}
                ></Select>
                <Select
                  size="large"
                  allowClear
                  style={{
                    width: 150,
                    borderRadius: 4,
                    borderColor: "#cccccc",
                    outline: "none",
                    fontSize: 14,
                    color: "#333333",
                    textAlign: "left",
                    marginRight: 20,
                  }}
                  value={city}
                  onChange={(value: any) => {
                    setCity(value);
                    let it = cityData.find((it: any) => it.value === value);
                    if (it) {
                      setCityText(it.label);
                    }
                  }}
                  placeholder="请选择市"
                  options={cityData}
                ></Select>
                <Select
                  size="large"
                  allowClear
                  style={{
                    width: 150,
                    borderRadius: 4,
                    borderColor: "#cccccc",
                    outline: "none",
                    fontSize: 14,
                    color: "#333333",
                    textAlign: "left",
                  }}
                  value={area}
                  onChange={(value: any) => {
                    setArea(value);
                    let it = areaData.find((it: any) => it.value === value);
                    if (it) {
                      setAreaText(it.label);
                    }
                  }}
                  placeholder="请选择区"
                  options={areaData}
                ></Select>
              </div>
              <div className={styles["label"]}>详细地址</div>
              <div className={styles["input-item"]}>
                <Input
                  className={styles["input"]}
                  autoComplete="off"
                  placeholder="例：阳光小区20栋2020"
                  value={street}
                  onChange={(e) => {
                    setStreet(e.target.value);
                  }}
                />
              </div>
              <div className={styles["btn-box"]}>
                <div
                  className={styles["submit"]}
                  onClick={() => submitValidate()}
                >
                  保存地址
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
