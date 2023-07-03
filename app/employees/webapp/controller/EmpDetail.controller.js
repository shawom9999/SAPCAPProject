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
                        let oContext = this.getView().getBindingContext(),
                            oObject = oContext.getObject(),
                            aProjId = oObject.LINK_TO_EMP_PROJ.map(oItem => oItem.PROJECT_ID),
                            aTechId = oObject.LINK_TO_EMP_TECH.map(oItem => oItem.TECH_ID);

                        this.oGlobalBusyDialog.close();
                        this.getView().setModel(new JSONModel({
                            "Address": oObject.LINK_TO_EMP_ADD,
                            "SEL_PROJECTS": aProjId,
                            "SEL_TECHNOLOGIES": aTechId
                        }), "oEmpDetailModel");
                        
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
                        parameters: {
                            $expand: {
                                "LINK_TO_DEPARTMENT": {},
                                "LINK_TO_EMP_ADD": {
                                    $expand: {
                                        "LINK_TO_COUNTRY": {},
                                        "LINK_TO_STATE": {},
                                        "LINK_TO_ADD_TYPE": {}
                                    },
                                    $select: "ID,LOCATION_DETAILS,REGION"
                                },
                                "LINK_TO_EMP_PROJ": {
                                    $expand: {
                                        "LINK_TO_PROJECTS": {}
                                    },
                                    $select: "PROJECT_ID"
                                },
                                "LINK_TO_EMP_TECH": {
                                    $select: "ID,EMP_ID,TECH_ID",
                                    $expand: {
                                        LINK_TO_TECHNOLOGIES: {}
                                    }
                                }
                            },
                            $select: "EMP_ID,FIRST_NAME,MIDDLE_NAME,LAST_NAME,PHONE,EMAIL,DATEOFBIRTH,CURRENCY,SALARY,DEPT_ID",
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