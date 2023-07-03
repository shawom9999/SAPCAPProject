sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/Filter"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, Filter) {
        "use strict";

        return Controller.extend("employees.controller.EmpMaster", {
            onInit: function () {
                this.oRouter = this.getOwnerComponent().getRouter();
                this.oRouter.getRoute("RouteEmployeeData").attachPatternMatched(this._onRouteMatched, this);
            },

            _onRouteMatched: function (oEvent) {
                let deptId = oEvent.getParameter("arguments").deptId,
                    deptEmpTable = this.getView().byId("deptEmpTable");

                if (deptId) {
                    let aFilters = [new Filter('DEPT_ID', "EQ", deptId)];
                    deptEmpTable.getBinding("items").filter(aFilters);                    
                }
            },

            handleEmpTableUpdateFinished: function (oEvent) {
                let tabLength = oEvent.getParameter("total"),
                    headerText = `List Of Employees (${tabLength})`;
                this.getView().byId("deptEmpTableTitle").setText(headerText);
            },

            onEmpCreate: function () {
                this.oRouter.navTo("RouteNewEmpCreation");
                this.getView().getParent().getParent().setMode("HideMode");
            }





            /*var oBinding = this.getView().getModel('catalogModel').bindList(
                "/Employees",
                undefined,
                undefined,
                aFilters
            );

            oBinding.requestContexts().then(aContext => {
                let aResObj = aContext.map(oItem => oItem.getObject());
            }).catch(oerr => {
                sap.m.MessageBox.error(oerr.toString());
            })*/
            
        });
    });
