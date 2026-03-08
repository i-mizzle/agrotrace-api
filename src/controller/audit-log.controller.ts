import { Request, Response } from "express";
import { get } from "lodash";
import * as response from '../responses'
import { getJsDate } from "../utils/utils";
import { findAuditLogs } from "../service/audit-log.service";


const parsePostFilters = (query: any) => {
    const { item, actionType, actor, minDate, maxDate } = query; 

    const filters: any = {}; 

    if (item) {
        filters.item = item; 
    }
  
    if (actionType) {
      filters.actionType = actionType 
    }
  
    if (actor) {
      filters.actor = actor
    }
  
    if (minDate) {
      filters.created = { $gte: (getJsDate(minDate)) }; 
    }
  
    if (maxDate) {
      filters.created = { $lte: getJsDate(maxDate) }; 
    }

    return filters
}


export async function getAuditLogsHandler(req: Request, res: Response) {
    const user: any = get(req, 'user')
    const queryObject: any = req.query;
    const filters = parsePostFilters(queryObject)
    const resPerPage = +queryObject.perPage || 25; // results per page
    const page = +queryObject.page || 1; // Page 

    let expand = queryObject.expand || null

    if(expand && expand.includes(',')) {
        expand = expand.split(',')
    }
    
    const auditLogs = await findAuditLogs(filters, resPerPage, page, expand);

    const responseObject = {
        page,
        perPage: resPerPage,
        total: auditLogs.total,
        logs: auditLogs.logs
    }
    return response.ok(res, responseObject)

}

export async function getAuditLogsForItemHandler(req: Request, res: Response) {
    const user: any = get(req, 'user')
    const itemId = get(req, 'params.itemId')
    const queryObject: any = req.query;
    const filters = parsePostFilters(queryObject)
    const resPerPage = +queryObject.perPage || 25; // results per page
    const page = +queryObject.page || 1; // Page 

    let expand = queryObject.expand || null

    if(expand && expand.includes(',')) {
        expand = expand.split(',')
    }
    
    const auditLogs = await findAuditLogs({...{item: itemId}, ...filters}, resPerPage, page, expand);

    const responseObject = {
        page,
        perPage: resPerPage,
        total: auditLogs.total,
        logs: auditLogs.logs
    }
    return response.ok(res, responseObject)

}

