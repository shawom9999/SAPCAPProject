sap.ui.require(
    [
        'sap/fe/test/JourneyRunner',
        'departments/test/integration/FirstJourney',
		'departments/test/integration/pages/DepartmentsList',
		'departments/test/integration/pages/DepartmentsObjectPage'
    ],
    function(JourneyRunner, opaJourney, DepartmentsList, DepartmentsObjectPage) {
        'use strict';
        var JourneyRunner = new JourneyRunner({
            // start index.html in web folder
            launchUrl: sap.ui.require.toUrl('departments') + '/index.html'
        });

       
        JourneyRunner.run(
            {
                pages: { 
					onTheDepartmentsList: DepartmentsList,
					onTheDepartmentsObjectPage: DepartmentsObjectPage
                }
            },
            opaJourney.run
        );
    }
);