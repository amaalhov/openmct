/*****************************************************************************
 * Open MCT, Copyright (c) 2014-2020, United States Government
 * as represented by the Administrator of the National Aeronautics and Space
 * Administration. All rights reserved.
 *
 * Open MCT is licensed under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * http://www.apache.org/licenses/LICENSE-2.0.
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations
 * under the License.
 *
 * Open MCT includes source code licensed under additional open source
 * licenses. See the Open Source Licenses file (LICENSES.md) included with
 * this source code distribution or the Licensing information page available
 * at runtime from the About dialog for additional information.
 *****************************************************************************/

define(
    function () {

        /**
         * MockMoveService provides the same interface as the moveService,
         * returning promises where it would normally do so.  At it's core,
         * it is a jasmine spy object, but it also tracks the promises it
         * returns and provides shortcut methods for resolving those promises
         * synchronously.
         *
         * Usage:
         *
         * ```javascript
         * var moveService = new MockMoveService();
         *
         * // validate is a standard jasmine spy.
         * moveService.validate.and.returnValue(true);
         * var isValid = moveService.validate(object, parentCandidate);
         * expect(isValid).toBe(true);
         *
         * // perform returns promises and tracks them.
         * var whenCopied = jasmine.createSpy('whenCopied');
         * moveService.perform(object, parentObject).then(whenCopied);
         * expect(whenCopied).not.toHaveBeenCalled();
         * moveService.perform.calls.mostRecent().resolve('someArg');
         * expect(whenCopied).toHaveBeenCalledWith('someArg');
         * ```
         */
        function MockMoveService() {
            // track most recent call of a function,
            // perform automatically returns
            var mockMoveService = jasmine.createSpyObj(
                'MockMoveService',
                [
                    'validate',
                    'perform'
                ]
            );

            mockMoveService.perform.and.callFake(() => {
                var performPromise,
                    callExtensions,
                    spy;

                performPromise = jasmine.createSpyObj(
                    'performPromise',
                    ['then']
                );

                callExtensions = {
                    promise: performPromise,
                    resolve: function (resolveWith) {
                        performPromise.then.calls.all().forEach(function (call) {
                            call.args[0](resolveWith);
                        });
                    }
                };

                spy = mockMoveService.perform;

                Object.keys(callExtensions).forEach(function (key) {
                    spy.calls.mostRecent()[key] = callExtensions[key];
                    spy.calls.all()[spy.calls.count() - 1][key] = callExtensions[key];
                });

                return performPromise;
            });

            return mockMoveService;
        }

        return MockMoveService;
    }
);
