import SuccessPage from "@/components/SuccessPage";
import { sellerRoutes } from "@/constants/routes";
import React from "react";

const SellerConfirmWithdrawal = () => {
  return (
    <SuccessPage
      header="Withdrawal confirmed"
      text="Your withdrawal request has been confirmed and will be processed within 24 hours."
      btnText="Back to Home"
      route={sellerRoutes?.earnings}
    />
  );
};

export default SellerConfirmWithdrawal;
