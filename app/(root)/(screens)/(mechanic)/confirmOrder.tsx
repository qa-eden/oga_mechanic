import SuccessPage from "@/components/SuccessPage";
import { mechanicRoutes } from "@/constants/routes";
import React from "react";

const ConfirmOrder = () => {
    return (
        <SuccessPage
            header="Successful"
            text="Your have successfully accepted this client’s service order"
            btnText="Done"
            route={mechanicRoutes.order}
        />
    );
};

export default ConfirmOrder;
