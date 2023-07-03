sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/Fragment",
    "sap/ui/model/Filter",
    "sap/m/MessageBox"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, JSONModel, Fragment, Filter, MessageBox) {
        "use strict";

        return Controller.extend("employees.controller.EmpMaster", {
            onInit: function () {
                this.oRouter = this.getOwnerComponent().getRouter();
                this.oRouter.getRoute("RouteEmpDetail").attachPatternMatched(this._onRouteMatched, this);
                this.oGlobalBusyDialog = new sap.m.BusyDialog();
            },

            _onRouteMatched: function (oEvent) {                
                this.oGlobalBusyDialog.open();
                let empId = oEvent.getParameter("arguments").empId;

                if (empId) {
                    this.handleViewBinding(empId).then(() => {
                        let oContext = this.getView().getBindingContext();
                    });
                } 
            },

             /**
             * Function for handling binding of the view
             */
             handleViewBinding: function (empId) {
                return new Promise((resolve, reject) => {
                    this.getView().bindElement({
                        path: "/Employees(" + empId + ")",
                        model: "catalogModel",
                        parameters: {
                            $expand: {
                                "LINK_TO_DEPARTMENT": {},
                                "LINK_TO_STLIB_RSN": {
                                    $expand: {
                                        "LINK_TO_RSN_TEXT": {
                                            $select: "ITEM,LANGUAGE_CODE,ADDITIONAL_TEXT,STATEMENT_ID"
                                        }
                                    },
                                    $select: "ITEM,RSN,DESCRIPTION,STATUS,VALID_TO,VALIDATED_BY,VALIDATED_ON,HISTORY_CRTD_DATE,HISTORY_CRTD_BY,STATEMENT_RSN_DESC"
                                },
                                "LINK_TO_EMP_PROJ": {
                                    $expand: {
                                        "LINK_TO_COUNTRIES": {
                                            $select: "REGION_CODE"
                                        }
                                    },
                                    $select: "CODE"
                                },
                                "LINK_TO_EMP_TECH": {
                                    $select: "ID,EMP_ID,TECH_ID",
                                    $expand: {
                                        LINK_TO_TECHNOLOGIES: {}
                                    }
                                }
                            },
                            $select: "",
                            $$updateGroupId: "empGroup"
                        },
                        events: {
                            dataReceived: function () {
                                resolve();
                            }.bind(this)
                        }
                    });
                });
            },

        // End   

    });
});