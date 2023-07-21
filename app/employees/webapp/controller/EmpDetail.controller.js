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
                this._empId = typeof(empId) === 'string' ? parseInt(empId) : empId;
                this.getView().getParent().getParent().setMode("HideMode");

                this.getView().setModel(new JSONModel({
                    "deleteEnabledAddress": false
                }), "oScreenMode");

                if (this._empId) {
                    this.handleViewBinding(empId).then(() => {
                        let oContext = this.getView().getBindingContext(),
                            oObject = oContext.getObject(),
                            aAddress = [],
                            aProjId = oObject.LINK_TO_EMP_PROJ.map(oItem => oItem.PROJECT_ID),
                            aTechId = oObject.LINK_TO_EMP_TECH.map(oItem => oItem.TECH_ID);

                        oObject.LINK_TO_EMP_ADD.forEach(oItem => {
                            aAddress.push({
                                "COUNTRY_ID": oItem.LINK_TO_COUNTRY?.COUNTRY_ID,
                                "COUNTRY_NAME": oItem.LINK_TO_COUNTRY?.COUNTRY_NAME,
                                "STATE_ID": oItem.LINK_TO_STATE?.STATE_ID,
                                "STATE_NAME": oItem.LINK_TO_STATE?.STATE_NAME,
                                "REGION": oItem.REGION,
                                "ADD_TYPE_ID": oItem.LINK_TO_ADD_TYPE?.ADD_TYPE_ID,
                                "ADD_TYPE": oItem.LINK_TO_ADD_TYPE?.ADD_TYPE,
                                "LOCATION_DETAILS": oItem.LOCATION_DETAILS  
                            })
                        });
                        this.oGlobalBusyDialog.close();
                        this.getView().setModel(new JSONModel({
                            "Address": aAddress,
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
                    oController = this;
                this.oGlobalBusyDialog.open();
                sap.ui.getCore().getMessageManager().removeAllMessages();

                this._saveEmpProjects();
                this._saveEmpTech();
                this._saveEmpAddress();

                oView.getModel().submitBatch("empGroup").then(function () {
                    oController.oGlobalBusyDialog.close();
                    MessageBox.success(`Employee ${oController._empId} \n updated successfully`,{
                        onClose: function () {
                            oView.getParent().getParent().setMode("PopoverMode");
                            oController.oRouter.navTo("RouteMaster");
                        }
                    });   
                }).catch(function (err) {
                    oController.oGlobalBusyDialog.close();
                    MessageBox.error(err.toString());
                });
            },

            _saveEmpProjects: function () {
                let oController = this,
                    oView = oController.getView(),
                    oContext = oView.getBindingContext(),
                    oEmpDetailModelData = oView.getModel("oEmpDetailModel").getData(),
                    aProjId = oEmpDetailModelData.SEL_PROJECTS,
                    aSavedProjects = oContext.getObject().LINK_TO_EMP_PROJ.map(oType => oType.PROJECT_ID),
                    bIsModified = false,
                    aModProj = [];

                //check if there were actual changes, only then update the Projects
                //check if something was added
                for (var oType of aProjId) {
                    if (!aSavedProjects.includes(oType)) {
                        bIsModified = true;
                        break;
                    }
                }

                //check if something was deleted
                if (aSavedProjects.length !== aProjId.length) {
                    bIsModified = true;
                }

                if (bIsModified) {
                    aProjId.forEach(oItem => {
                        aModProj.push({
                            EMP_ID: oController._empId,
                            PROJECT_ID: oItem
                        });
                    })
                    var oUpdateAction = oView.getModel().bindContext("CatalogService.updateSelectedProjects(...)",
                        oContext, {
                        $$updateGroupId: "empGroup"
                    });

                    oUpdateAction.setParameter("selectedProjects", aModProj);

                    oUpdateAction.execute("empGroup").catch(function (err) {
                        console.log(err)
                    });
                }

            },

            _saveEmpTech: function () {
                let oController = this,
                    oView = oController.getView(),
                    oContext = oView.getBindingContext(),
                    oEmpDetailModelData = oView.getModel("oEmpDetailModel").getData(),
                    aTech = oEmpDetailModelData.SEL_TECHNOLOGIES,
                    aSavedTech = oContext.getObject().LINK_TO_EMP_TECH.map(oType => oType.TECH_ID),
                    bIsModified = false,
                    aModTech = [];

                //check if there were actual changes, only then update the Projects
                //check if something was added
                for (var oType of aTech) {
                    if (!aSavedTech.includes(oType)) {
                        bIsModified = true;
                        break;
                    }
                }

                //check if something was deleted
                if (aSavedTech.length !== aTech.length) {
                    bIsModified = true;
                }

                if (bIsModified) {
                    aTech.forEach(oItem => {
                        aModTech.push({
                            EMP_ID: oController._empId,
                            TECH_ID: oItem
                        });
                    })
                    var oUpdateAction = oView.getModel().bindContext("CatalogService.updateSelectedTechnologies(...)",
                        oContext, {
                        $$updateGroupId: "empGroup"
                    });

                    oUpdateAction.setParameter("selectedTechnolgies", aModTech);

                    oUpdateAction.execute("empGroup").catch(function (err) {
                        console.log(err)
                    });
                }

            },

            _saveEmpAddress: function () {
                let oController = this,
                    oView = oController.getView(),
                    oContext = oView.getBindingContext(),
                    oEmpDetailModelData = oView.getModel("oEmpDetailModel").getData(),
                    aAddress = oEmpDetailModelData.Address,
                    aModAddress = [];
                
                aAddress.forEach(oItem => {
                    aModAddress.push({
                        EMP_EMP_ID: oController._empId,
                        COUNTRY_ID        : oItem.COUNTRY_ID,
                        STATE_ID          : oItem.STATE_ID,
                        REGION            : oItem.REGION,
                        LOCATION_DETAILS  : oItem.LOCATION_DETAILS,
                        ADD_TYPE_ID       : oItem.ADD_TYPE_ID
                    });
                });
                var oUpdateAction = oView.getModel().bindContext("CatalogService.updateAddress(...)",
                    oContext, {
                    $$updateGroupId: "empGroup"
                });

                oUpdateAction.setParameter("aAddress", aModAddress);

                oUpdateAction.execute("empGroup").catch(function (err) {
                    console.log(err)
                });

            },

        // End   

    });
});