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
                this.oRouter.getRoute("RouteNewEmpCreation").attachPatternMatched(this._onRouteMatched, this);
                this.oGlobalBusyDialog = new sap.m.BusyDialog();
            },

            _onRouteMatched: function () {
                let oCreateEmpModel = this._createEmpModel();                  
                this.getView().setModel(oCreateEmpModel, "oCreateEmpModel");                
                this.getView().setModel(new JSONModel({
                    "deleteEnabledAddress": false
                }), "oScreenMode");

                this.getView().getParent().getParent().setMode("HideMode");
            },

            _createEmpModel: function () {
                return new JSONModel ({
                    // "EMP_ID": null,
                    "FIRST_NAME": "",
                    "MIDDLE_NAME": "",
                    "LAST_NAME": "",
                    "EMAIL": null,
                    "PHONE": null,
                    "DATEOFBIRTH": null,
                    "DEPT_ID": null,
                    "CURRENCY": null,
                    "SALARY": null,
                    "SEL_PROJECTS": null,
                    "SEL_TECHNOLOGIES": null,
                    "Address": [],
                    "DEPT_NAME": null
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

            /**
             * Function called to enable/disable delete button upon address types selection change
             */
             onAddTabSelChange: function () {
                //Enable delete button if at least one entry is selected
                var oTable = this.getView().byId("AddEmpTable");
                if (oTable.getSelectedItems().length !== 0) {
                    this.getView().getModel("oScreenMode").setProperty("/deleteEnabledAddress", true);
                } else {
                    this.getView().getModel("oScreenMode").setProperty("/deleteEnabledAddress", false);
                }
            },

            onDeleteAddress: function () {
                let oCreateEmpModel = this.getView().getModel("oCreateEmpModel"),
                    aAddress = oCreateEmpModel.getProperty("/Address"),
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
                            oController._executeAfterDeleteAddress(oCreateEmpModel, oTable, aRecordItems);
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

            /**
             * Function called to filter state based on selected country
             */
            onAddCountrySelChange: function (oEvent) {
                let selConId = oEvent.getParameter("selectedItem").getKey(),
                    stateComboBox = sap.ui.getCore().byId("AddStateComboBox");
                if (selConId?.length > 0) {
                    let aFilters = [new Filter('COUNTRY_ID', "EQ", selConId)];
                    stateComboBox.getBinding("items").filter(aFilters);
                }
            },

            handleAddressTableUpdateFinished: function (oEvent) {
                let tabLength = oEvent.getParameter("total"),
                    headerText = `Employee Address (${tabLength})`;
                this.getView().byId("empAddressTableTitle").setText(headerText);
            },

            /**
             * Function to handle adding a new address
             */
            onAddressOkPress: function () {
                let oCreateEmpModel = this.getView().getModel("oCreateEmpModel"),
                    oCreateAddModel = this.getView().getModel("oCreateAddModel"),
                    aAddress = oCreateEmpModel.getProperty("/Address"),
                    addTypeComboBox = sap.ui.getCore().byId("AddTypeComboBox"),
                    addStateComboBox = sap.ui.getCore().byId("AddStateComboBox"),
                    addCountryComboBox = sap.ui.getCore().byId("AddCountryComboBox");

                oCreateAddModel.setProperty("/ADD_TYPE", addTypeComboBox.getSelectedItem()?.getText());
                oCreateAddModel.setProperty("/STATE_NAME", addStateComboBox.getSelectedItem()?.getText());
                oCreateAddModel.setProperty("/COUNTRY_NAME", addCountryComboBox.getSelectedItem()?.getText());

                aAddress.push(oCreateAddModel.getData());
                oCreateEmpModel.setProperty("/Address", aAddress);

                this.onCancelAddress();
            },

            onSaveEmp: function () {
                var oView = this.getView(),
                    oController = this,
                    oCreateEmpModel = oView.getModel("oCreateEmpModel"),
                    oCreateEmpModelData = oCreateEmpModel.getData(),
                    aAddObject = [];
                this.oGlobalBusyDialog.open();
                sap.ui.getCore().getMessageManager().removeAllMessages();

                if (oCreateEmpModelData.Address.length > 0) {
                    oCreateEmpModelData.Address.forEach(oItem => {
                        aAddObject.push({
                            COUNTRY_ID: oItem.COUNTRY_ID,
                            STATE_ID: oItem.STATE_ID,
                            REGION: oItem.REGION,
                            LOCATION_DETAILS: oItem.LOCATION_DETAILS,
                            ADD_TYPE_ID: oItem.ADD_TYPE_ID
                        });
                    });
                }

                let oEmpObject = {
                    // EMP_ID: parseInt(oCreateEmpModelData.EMP_ID),
                    FIRST_NAME: oCreateEmpModelData.FIRST_NAME,
                    MIDDLE_NAME: oCreateEmpModelData.MIDDLE_NAME,
                    LAST_NAME: oCreateEmpModelData.LAST_NAME,
                    EMAIL: oCreateEmpModelData.EMAIL,
                    DATEOFBIRTH: oCreateEmpModelData.DATEOFBIRTH,
                    PHONE: parseInt(oCreateEmpModelData.PHONE),
                    SALARY: parseInt(oCreateEmpModelData.SALARY),
                    DEPT_ID: parseInt(oCreateEmpModelData.DEPT_ID.replace(",","")),
                    CURRENCY: oCreateEmpModelData.CURRENCY,
                    LINK_TO_EMP_ADD: aAddObject
                }
                
                let oBinding = oView.getModel().bindList(
                    "/Employees",
                    undefined,
                    undefined,
                    undefined, {
                    $$updateGroupId: 'empGroup'
                });

               var oContext = oBinding.create(oEmpObject);

                oView.getModel().submitBatch("empGroup").then(function () {
                    let oObject = oContext.getObject();
                    oCreateEmpModel.setProperty("/EMP_ID", oObject.EMP_ID);
                    oController._saveAssociations();   
                }).catch(function (err) {
                    oController.oGlobalBusyDialog.close();
                    MessageBox.error(err.toString());
                }); 
            },

            _saveAssociations: function () {
                var oView = this.getView(),
                    oController = this,
                    oCreateEmpModel = oView.getModel("oCreateEmpModel"),
                    oCreateEmpModelData = oCreateEmpModel.getData(),
                    empId = oCreateEmpModelData.EMP_ID,
                    empId = typeof(empId) === 'string' ? parseInt(empId) : empId;

                let oProjBinding = oView.getModel().bindList(
                    "/EmpProjects",
                    undefined,
                    undefined,
                    undefined, {
                    $$updateGroupId: 'associationsGroup'
                });

                oCreateEmpModelData.SEL_PROJECTS.forEach(oItem => {
                    oProjBinding.create({
                        EMP_ID: empId,
                        PROJECT_ID: oItem
                    });
                });

                let oTechBinding = oView.getModel().bindList(
                    "/EmpTechnology",
                    undefined,
                    undefined,
                    undefined, {
                    $$updateGroupId: 'associationsGroup'
                });

                oCreateEmpModelData.SEL_TECHNOLOGIES.forEach(oItem => {
                    oTechBinding.create({
                        EMP_ID: empId,
                        TECH_ID: oItem
                    });
                });

                oView.getModel().submitBatch("associationsGroup").then(function () {
                    oController.oGlobalBusyDialog.close();
                    MessageBox.success(`Employee ${empId} \n created successfully`,{
                        onClose: function () {
                            oView.getParent().getParent().setMode("ShowHideMode");
                            oController.oRouter.navTo("RouteMaster");
                        }
                    });

                }).catch(function (err) {
                    oController.oGlobalBusyDialog.close();
                    MessageBox.error(err.toString());
                }); 
            },

            /**
             * Function called to open Department value help dialog
             */
             handleDeptValueHelp: function () {
                Fragment.load({
                    name: "employees.view.DeptValueHelp",
                    controller: this
                }).then(function name(oFragment) {
                    this.deptValueHelp = oFragment;
                    this.getView().addDependent(this.deptValueHelp);
                    oFragment.open();
                }.bind(this));
            },

            onDeptValueHelpClose: function () {
                this.deptValueHelp.close();
                this.deptValueHelp.destroy(); 
            },

            onDeptOkPress: function () {
                let deptComboBox = sap.ui.getCore().byId("deptValueHelp"),
                    oCreateEmpModel = this.getView().getModel("oCreateEmpModel");
                oCreateEmpModel.setProperty("/DEPT_ID", deptComboBox.getSelectedKey());
                oCreateEmpModel.setProperty("/DEPT_NAME", deptComboBox.getSelectedItem()?.getText());

                this.onDeptValueHelpClose();
            }
            
        });
    });
