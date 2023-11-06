import SuperTokens from "supertokens-web-js";
import Session from "supertokens-web-js/recipe/session";
import EmailPassword from "supertokens-web-js/recipe/emailpassword";

SuperTokens.init({
  appInfo: {
    appName: "ODN Apps",
    apiDomain: "http://191.96.57.242:8085",
    apiBasePath: "/api/auth",
  },
  recipeList: [Session.init(), EmailPassword.init()],
});
