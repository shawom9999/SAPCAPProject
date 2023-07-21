using CatalogService as service from '../../srv/cat-service';

annotate service.Departments with @(
    UI.LineItem : [
        {
            $Type : 'UI.DataField',
            Label : 'DEPT_ID',
            Value : DEPT_ID,
        },
        {
            $Type : 'UI.DataField',
            Label : 'DEPT_NAME',
            Value : DEPT_NAME,
        },
        {
            $Type : 'UI.DataField',
            Label : 'MANAGER_ID',
            Value : MANAGER_ID,
        },
    ]
);
annotate service.Departments with @(
    UI.FieldGroup #GeneratedGroup1 : {
        $Type : 'UI.FieldGroupType',
        Data : [
            {
                $Type : 'UI.DataField',
                Label : 'DEPT_ID',
                Value : DEPT_ID,
            },
            {
                $Type : 'UI.DataField',
                Label : 'DEPT_NAME',
                Value : DEPT_NAME,
            },
            {
                $Type : 'UI.DataField',
                Label : 'MANAGER_ID',
                Value : MANAGER_ID,
            },
        ],
    },
    UI.Facets : [
        {
            $Type : 'UI.ReferenceFacet',
            ID : 'GeneratedFacet1',
            Label : 'General Information',
            Target : '@UI.FieldGroup#GeneratedGroup1',
        },
    ]
);
