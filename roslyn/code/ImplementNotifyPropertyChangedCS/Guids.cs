// *********************************************************
//
// Copyright © Microsoft Corporation
//
// Licensed under the Apache License, Version 2.0 (the
// "License"); you may not use this file except in
// compliance with the License. You may obtain a copy of
// the License at
//
// http://www.apache.org/licenses/LICENSE-2.0 
//
// THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES
// OR CONDITIONS OF ANY KIND, EITHER EXPRESS OR IMPLIED,
// INCLUDING WITHOUT LIMITATION ANY IMPLIED WARRANTIES
// OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR
// PURPOSE, MERCHANTABILITY OR NON-INFRINGEMENT.
//
// See the Apache 2 License for the specific language
// governing permissions and limitations under the License.
//
// *********************************************************

using System;

namespace ImplementNotifyPropertyChangedCS
{
    public static class Guids
    {
        public const string PackageIdString = "fcbf5f10-1e87-442e-9678-01b7e267f27a";
        public const string CommandSetIdString = "86e61a43-66d5-445d-ba69-411d49007af5";

        public static readonly Guid PackageId = new Guid(PackageIdString);
        public static readonly Guid CommandSetId = new Guid(CommandSetIdString);
    }
}
