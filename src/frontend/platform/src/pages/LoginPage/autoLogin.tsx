import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { loginApi } from "../../controllers/API/user";
import { captureAndAlertRequestErrorHoc } from "../../controllers/request";
import { handleEncrypt } from "./utils";

/**
 * 自动登录页面
 * 访问 /autologin?username=xxx&password=xxx 即可自动登录
 */
export const AutoLoginPage = () => {
    const [searchParams] = useSearchParams();
    const [status, setStatus] = useState<"loading" | "error">("loading");
    const [errorMsg, setErrorMsg] = useState("");

    useEffect(() => {
        const username = searchParams.get("username");
        const password = searchParams.get("password");

        if (!username || !password) {
            setErrorMsg("缺少 username 或 password 参数");
            setStatus("error");
            return;
        }

        handleEncrypt(password).then(encryptedPwd => {
            captureAndAlertRequestErrorHoc(
                loginApi(username, encryptedPwd, "", "").then((res: any) => {
                    window.self === window.top
                        ? localStorage.removeItem("ws_token")
                        : localStorage.setItem("ws_token", res.access_token);
                    localStorage.setItem("isLogin", "1");
                    // @ts-ignore
                    const path = import.meta.env.DEV ? "/admin" : `${__APP_ENV__.BASE_URL}/workspace/`;
                    // @ts-ignore
                    location.href = `${location.origin}${path}`;
                }),
                (error) => {
                    setErrorMsg(error || "登录失败，请检查用户名和密码");
                    setStatus("error");
                }
            );
        }).catch(() => {
            setErrorMsg("加密失败，请重试");
            setStatus("error");
        });
    }, []);

    if (status === "error") {
        return (
            <div className="w-full h-full flex items-center justify-center bg-background-dark">
                <div className="text-center">
                    <p className="text-red-500 text-lg mb-4">{errorMsg}</p>
                    <a href="/" className="text-blue-500 hover:underline">返回登录页</a>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full h-full flex items-center justify-center bg-background-dark">
            <div className="text-center text-gray-400">
                <p>正在自动登录，请稍候...</p>
            </div>
        </div>
    );
};
