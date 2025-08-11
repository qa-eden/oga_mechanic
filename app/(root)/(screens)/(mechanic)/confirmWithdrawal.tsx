import SuccessPage from "@/components/SuccessPage";
import { mechanicRoutes } from "@/constants/routes";
import React from "react";

const ConfirmWithdrawal = () => {
  return (
    <SuccessPage
      header="Withdrawal confirmed"
      text="Your withdrawal request has been confirmed and will be processed within 24 hours."
      btnText="Back to Home"
      route={mechanicRoutes?.home}
    />
  );
};

export default ConfirmWithdrawal;
