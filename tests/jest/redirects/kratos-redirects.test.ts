// Copyright © 2022 Ory Corp
// SPDX-License-Identifier: Apache-2.0

import { readSitemapXML, runTest } from "./utils"

const sitemap = readSitemapXML("sitemap_kratos.xml")

it("test kratos sitemap", async () => {
  await runTest(sitemap)
})
