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
                this.getView().getParent().getParent().setMode("HideMode");

                this.getView().setModel(new JSONModel({
                    "deleteEnabledAddress": false
                }), "oScreenMode");

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

            _createAddModel: function () {
                return new JSONModel ({
                    // "ADDRESS_ID": null,
                    "COUNTRY_ID": null,
                    "COUNTRY_NAME": null,
                    "STATE_ID": null,
                    "STATE_NAME": null,
                    "REGION": null,
                    "ADD_TYPE_ID": null,
                    "ADD_TYPE": null,
                    "LOCATION_DETAILS": null
                });
            },

            onCancelPress: function () {
                this.oRouter.navTo("RouteMaster");
                this.getView().getParent().getParent().setMode("ShowHideMode");
            },

            onAddTabSelChange: function () {
                //Enable delete button if at least one entry is selected
                var oTable = this.getView().byId("AddEmpTable");
                if (oTable.getSelectedItems().length !== 0) {
                    this.getView().getModel("oScreenMode").setProperty("/deleteEnabledAddress", true);
                } else {
                    this.getView().getModel("oScreenMode").setProperty("/deleteEnabledAddress", false);
                }
            },

            handleAddressTableUpdateFinished: function (oEvent) {
                let tabLength = oEvent.getParameter("total"),
                    headerText = `Employee Address (${tabLength})`;
                this.getView().byId("empAddressTableTitle").setText(headerText);
            },

            onDeleteAddress: function () {
                let oEmpDetailModel = this.getView().getModel("oEmpDetailModel"),
                    aAddress = oEmpDetailModel.getProperty("/Address"),
                    oTable = this.getView().byId("AddEmpTable"),
                    aSelectedItems = oTable.getSelectedItems(),
                    oController = this;

                if (aSelectedItems.length > 0)
                    MessageBox.confirm(
                        "Are you sure you want to delete selected items?", {
                        onClose: function (oAction) {
                            if (oAction === "CANCEL") {
                                return;
                            }
                            let aRecordItems = oController._deleteAddress(aSelectedItems, aAddress);
                            oController._executeAfterDeleteAddress(oEmpDetailModel, oTable, aRecordItems);
                        }
                    });
            },

            _deleteAddress: function (aSelectedItems, aAddress) {
                var aTemp = [];
                jQuery.each(aSelectedItems, function (index) {
                    aTemp.push(aSelectedItems[index].sId.split("-")[aSelectedItems[index].sId.split("-").length - 1]);
                });

                aTemp.forEach(function (item, idx) {
                    if (idx !== 0) {
                        item = item - idx;
                    }
                    aAddress.splice(item, 1);

                });

                return aAddress;
            },

            _executeAfterDeleteAddress: function (oModel, oTable, aAddress) {
                //Call the setter to trigger the refreshing of the bindings
                oModel.setProperty("/Address", aAddress);

                //Call the trigger after updating the table content
                oTable.removeSelections(true);
                this.onAddTabSelChange();
            },

            /**
             * Function called to open Address value help dialog
             */
            onEmpAddressCreate: function () {
                let oCreateAddModel = this._createAddModel();
                this.getView().setModel(oCreateAddModel, "oCreateAddModel");

                Fragment.load({
                    name: "employees.view.AddressValueHelp",
                    controller: this
                }).then(function name(oFragment) {
                    this.addressFragment = oFragment;
                    this.getView().addDependent(this.addressFragment);
                    oFragment.open();
                }.bind(this));
            },

            onCancelAddress: function () {
                this.addressFragment.close();
                this.addressFragment.destroy();
            },

            onAddCountrySelChange: function (oEvent) {
                let selConId = oEvent.getParameter("selectedItem").getKey(),
                    stateComboBox = sap.ui.getCore().byId("AddStateComboBox");
                if (selConId?.length > 0) {
                    let aFilters = [new Filter('COUNTRY_ID', "EQ", selConId)];
                    stateComboBox.getBinding("items").filter(aFilters);
                }
            },

            onAddressOkPress: function () {
                let oEmpDetailModel = this.getView().getModel("oEmpDetailModel"),
                    oCreateAddModel = this.getView().getModel("oCreateAddModel"),
                    aAddress = oEmpDetailModel.getProperty("/Address"),
                    addTypeComboBox = sap.ui.getCore().byId("AddTypeComboBox"),
                    addStateComboBox = sap.ui.getCore().byId("AddStateComboBox"),
                    addCountryComboBox = sap.ui.getCore().byId("AddCountryComboBox");

                oCreateAddModel.setProperty("/ADD_TYPE", addTypeComboBox.getSelectedItem()?.getText());
                oCreateAddModel.setProperty("/STATE_NAME", addStateComboBox.getSelectedItem()?.getText());
                oCreateAddModel.setProperty("/COUNTRY_NAME", addCountryComboBox.getSelectedItem()?.getText());

                aAddress.push(oCreateAddModel.getData());
                oEmpDetailModel.setProperty("/Address", aAddress);

                this.onCancelAddress();
            },

            onSaveEmp: function () {
                var oView = this.getView(),
                    oController = this,
                    oContext = oView.getBindingContext(),
                    oEmpDetailModelData = oView.getModel("oEmpDetailModel").getData(),
                    aAddObject = [];
                this.oGlobalBusyDialog.open();
                sap.ui.getCore().getMessageManager().removeAllMessages();

                oEmpDetailModelData.Address.forEach(oItem => {
                    aAddObject.push({
                        COUNTRY_ID: oItem.COUNTRY_ID,
                        STATE_ID: oItem.STATE_ID,
                        REGION: oItem.REGION,
                        LOCATION_DETAILS: oItem.LOCATION_DETAILS,
                        ADD_TYPE_ID: oItem.ADD_TYPE_ID
                    });
                });

                oContext.setProperty("LINK_TO_EMP_ADDRESS", aAddObject);

                oView.getModel().submitBatch("empGroup").then(function () {
                    oController.oGlobalBusyDialog.close();
                    MessageBox.success(`Employee ${empId} \n updated successfully`,{
                        onClose: function () {
                            oView.getParent().getParent().setMode("ShowHideMode");
                            oController.oRouter.navTo("RouteMaster");
                        }
                    });   
                }).catch(function (err) {
                    oController.oGlobalBusyDialog.close();
                    MessageBox.error(err.toString());
                });
            }

        // End   

    });
});