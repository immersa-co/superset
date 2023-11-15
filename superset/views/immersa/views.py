# Licensed to the Apache Software Foundation (ASF) under one
# or more contributor license agreements.  See the NOTICE file
# distributed with this work for additional information
# regarding copyright ownership.  The ASF licenses this file
# to you under the Apache License, Version 2.0 (the
# "License"); you may not use this file except in compliance
# with the License.  You may obtain a copy of the License at
#
#   http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing,
# software distributed under the License is distributed on an
# "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
# KIND, either express or implied.  See the License for the
# specific language governing permissions and limitations
# under the License.

import os

import requests
from flask import request, Response, session
from flask_appbuilder import permission_name
from flask_appbuilder.api import expose
from flask_appbuilder.security.decorators import has_access
from flask_babel import _

from superset import event_logger
from superset.constants import MODEL_VIEW_RW_METHOD_PERMISSION_MAP
from superset.superset_typing import FlaskResponse
from superset.views.base import (
    api,
    BaseSupersetView,
    handle_api_exception,
    json_error_response,
)


class ImmersaView(BaseSupersetView):  # pylint: disable=too-many-ancestors
    route_base = "/immersa"
    class_permission_name = "Immersa"
    method_permission_name = MODEL_VIEW_RW_METHOD_PERMISSION_MAP

    @expose("/")
    @event_logger.log_this
    def root(self) -> FlaskResponse:
        return super().render_app_template()

    # For lists only
    @expose("/list/")
    @event_logger.log_this
    # @has_access
    # @permission_name("show")
    def list(self) -> FlaskResponse:
        return super().render_app_template()

    @expose("/segments/<path:custom_path>")
    @api
    @handle_api_exception
    def segments_proxy(self, custom_path: str) -> FlaskResponse:
        token_getter = session.get("oauth")
        if token_getter is None:
            return json_error_response(_("Request missing token."), status=401)

        token = token_getter[0]

        headers = {
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json",
        }

        url = f'{os.getenv("LIVEOPS_SERVICE_URL")}/segments/{custom_path}'

        response = requests.request(
            method=request.method, url=url, headers=headers, data=request.get_data()
        )

        return Response(
            response.content, status=response.status_code, mimetype="application/json"
        )
