import {  FieldRef,  FieldMetadata, Entity, ValueListItem } from "@remult/core";
import { ValueListValueConverter } from "@remult/core/valueConverters";
import { InputField } from "./column-collection";



export type DataControlInfo<rowType> = DataControlSettings<rowType> | FieldRef<any, any>;
export interface DataControlSettings<entityType = any, fieldType = any> {

    field?: FieldMetadata | FieldRef<any, any>;
    getValue?: (row: entityType, val: FieldRef<fieldType, entityType>) => any;
    readonly?: ValueOrEntityExpression<boolean, entityType>;
    cssClass?: (string | ((row: entityType) => string));

    caption?: string;
    visible?: (row: entityType, val: FieldRef<fieldType, entityType>) => boolean;

    click?: (row: entityType, val: FieldRef<fieldType, entityType>) => void;
    valueChange?: (row: entityType, val: FieldRef<fieldType, entityType>) => void;
    allowClick?: (row: entityType, val: FieldRef<fieldType, entityType>) => boolean;
    clickIcon?: string;

    valueList?: ValueListItem[] | string[] | any[] | Promise<ValueListItem[]> | ((context) => Promise<ValueListItem[]>) | ((context) => ValueListItem[]);
    inputType?: string; //used: password,date,tel,text,checkbox,number
    hideDataOnInput?: boolean;//consider also setting the width of the data on input - for datas with long input
    forceEqualFilter?: boolean;

    width?: string;
}






export const configDataControlField = Symbol('configDataControlField');

export function getFieldDefinition(col: FieldMetadata | FieldRef<any, any>) {
    if (!col)
        return undefined;
    let r = col as FieldMetadata;
    let c = col as FieldRef<any, any>;
    if (c.metadata)
        r = c.metadata;
    return r;

}
export function decorateDataSettings(colInput: FieldMetadata | FieldRef<any, any>, x: DataControlSettings) {
    if (colInput instanceof InputField) {

        for (const key in colInput.dataControl) {
            if (Object.prototype.hasOwnProperty.call(colInput.dataControl, key)) {
                const element = colInput.dataControl[key];
                if (x[key] === undefined)
                    x[key] = element;
            }

        }
    }

    let col = getFieldDefinition(colInput);
    if (col.target) {
        let settingsOnColumnLevel = Reflect.getMetadata(configDataControlField, col.target, col.key);
        if (settingsOnColumnLevel) {
            for (const key in settingsOnColumnLevel) {
                if (Object.prototype.hasOwnProperty.call(settingsOnColumnLevel, key)) {
                    const element = settingsOnColumnLevel[key];
                    if (x[key] === undefined)
                        x[key] = element;
                }
            }
        }
    }
    if (col.dataType) {
        let settingsOnColumnLevel = Reflect.getMetadata(configDataControlField, col.dataType);
        if (settingsOnColumnLevel) {
            for (const key in settingsOnColumnLevel) {
                if (Object.prototype.hasOwnProperty.call(settingsOnColumnLevel, key)) {
                    const element = settingsOnColumnLevel[key];
                    if (x[key] === undefined)
                        x[key] = element;
                }
            }
        }
    }
    if (x.valueList === undefined && col && col.valueConverter instanceof ValueListValueConverter)
        x.valueList = col.valueConverter.getOptions();


    if (!x.caption && col.caption)
        x.caption = col.caption;

    if (!x.inputType && col.inputType)
        x.inputType = col.inputType;

    if (x.readonly == undefined) {
        if (col.dbReadOnly)
            x.readonly = true;

        if (typeof col.options?.allowApiUpdate === 'boolean')
            x.readonly = !col.options.allowApiUpdate;
    }
}


export declare type ValueOrEntityExpression<valueType, entityType> = valueType | ((e: entityType) => valueType);


export function DataControl<entityType = any, colType = any>(settings: DataControlSettings<entityType, colType>) {
    return (target, key?) => {
        Reflect.defineMetadata(configDataControlField, settings, target, key);
        if (key === undefined)
            return target;
    }
}