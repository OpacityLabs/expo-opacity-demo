import { NavigationProp } from "@react-navigation/native";
import parseUrl from "parse-url";
import React, { useEffect } from "react";
import { Pressable, Text, View } from "react-native";
import WebView from "react-native-webview";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import {
  codeState,
  randomDeviceIdState,
  randomStateState,
  tokenState,
} from "../../atoms";
import { submitCode } from "../../doordash";
import { NavParams } from "../../navigation";
import { generateDoordashLoginUrl } from "../../utils";

interface Props {
  navigation: NavigationProp<NavParams, "Profile">;
}

export const Login = ({ navigation }: Props) => {
  const { goBack } = navigation;
  const deviceId = useRecoilValue(randomDeviceIdState);
  const state = useRecoilValue(randomStateState);
  const [code, setCode] = useRecoilState(codeState);

  const setToken = useSetRecoilState(tokenState);

  useEffect(() => {
    if (code) {
      submitCode(code).then((resp) => {
        console.log("token", resp.token.token);
        setToken(resp.token.token);
        goBack();
      });
    }
  }, [code]);

  return (
    <View className="flex-1">
      <View className="h-12 flex-row items-center justify-between bg-black px-4">
        <View className="w-8"></View>
        <Text className="text-white">Doordash Login</Text>
        <Pressable
          className="h-8 w-8 items-end justify-center"
          onPress={goBack}
        >
          <Text className="text-xs text-gray-200">Close</Text>
        </Pressable>
      </View>

      <WebView
        className="flex-1"
        scalesPageToFit={false}
        // Remove incognito to preserve cache and restore login between sessions
        incognito={false}
        userAgent={
          "Mozilla/5.0 (Linux; Android 14; Pixel 8 Pro Build/AP1A.240305.019.A1; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/125.0.6422.3 Mobile Safari/537.36"
        }
        source={{ uri: generateDoordashLoginUrl(deviceId, state) }}
        // onNavigationStateChange={(navState) => {
        //   console.log('navState', navState);
        // if (navState.url.startsWith('ios-identity-framework://')) {
        //   console.log('request', navState.url);
        //   const parsedUrl = parseUrl(navState.url)
        //   const code = parsedUrl.query.code
        //   setCode(code)
        //   return false;
        // }
        // }}
        onShouldStartLoadWithRequest={(req) => {
          console.log("request", req.url);

          if (req.url.startsWith("ios-identity-framework://")) {
            console.log("request", req.url);
            const parsedUrl = parseUrl(req.url);
            const code = parsedUrl.query.code;
            setCode(code);
            return false;
          }
          return true;
        }}
      />
    </View>
  );
};
