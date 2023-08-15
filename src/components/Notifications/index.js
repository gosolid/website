import { Helmet } from 'react-helmet';

const OneSignalInitCode = `
  window.OneSignal = window.OneSignal || [];
  OneSignal.push(function() {
    OneSignal.init({
      appId: "6f81b403-b1cd-4ce4-833c-ff328becdee0",
      safari_web_id: "web.onesignal.auto.2e21fe47-8329-4413-bae9-ecef4da3342d",
      notifyButton: {
        enable: true,
      },
    });
  });
`;

const Notifications = () => {
  return (
    <>
      <Helmet>
        <script src="https://cdn.onesignal.com/sdks/OneSignalSDK.js" async="" />
        <script dangerouslySetInnerHTML={{ __html: OneSignalInitCode }} />
      </Helmet>
    </>
  );
};
