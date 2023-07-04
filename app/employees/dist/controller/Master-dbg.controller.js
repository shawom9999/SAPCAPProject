sap.ui.define([
    "sap/ui/core/mvc/Controller"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller) {
        "use strict";

        return Controller.extend("employees.controller.Master", {
            onInit: function () {
                this.oRouter = this.getOwnerComponent().getRouter();
            },

            onDeptPress: function (oEvent) {
                let oSelItemObj = oEvent.getParameter("listItem").getBindingContext().getObject();
                this.oRouter.navTo("RouteEmployeeData", {
                    deptId: oSelItemObj.DEPT_ID
                });
            }
        });
    });
