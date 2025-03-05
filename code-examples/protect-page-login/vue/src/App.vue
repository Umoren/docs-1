<!-- Copyright © 2022 Ory Corp -->
<!-- SPDX-License-Identifier: Apache-2.0 -->

<template>
  <div class="main">
    <h1>{{ msg }}</h1>

    <div v-if="!session">
      <p>Click on "login" or "Sign Up" below to sign in.</p>
      <!-- highlight-start -->
      <li><a :href="basePath + '/ui/login'" data-testid="sign-in">Login</a></li>
      <li>
        <a :href="basePath + '/ui/registration'" data-testid="sign-up">Sign Up</a>
      </li>
      <!-- highlight-end -->
    </div>

    <h3 v-if="session">Calling <code>toSession()</code></h3>
    <div v-if="session" class="long">
      <p>
        Use the SDK's <code>toSession()</code> call to receive the session
        information, for example the authentication methods used:
      </p>
      <!-- highlight-start -->
      <pre><code data-testid='ory-response'>{{ session.authentication_methods }}</code></pre>
      <!-- highlight-end -->
    </div>

    <h3 v-if="apiResponse">API Response</h3>
    <div v-if="apiResponse" class="long">
      <p>
        Or make authenticated AJAX calls to your API using <code>fetch()</code>:
      </p>
      <!-- highlight-start -->
      <pre><code data-testid='api-response'>{{ apiResponse }}</code></pre>
      <!-- highlight-end -->
    </div>

    <h3 v-if="session">Common Actions</h3>
    <ul v-if="session">
      <!-- highlight-start -->
      <li><a :href="logoutUrl" data-testid="logout">Logout</a></li>
      <li>
        <a :href="basePath + '/ui/settings'" data-testid="settings">Settings</a>
      </li>
      <!-- highlight-end -->
    </ul>

    <h3>Essential Links</h3>
    <ul>
      <li><a href="https://www.ory.sh">Ory Website</a></li>
      <li><a href="https://github.com/ory">Ory GitHub</a></li>
      <li><a href="https://www.ory.sh/docs">Documentation</a></li>
    </ul>
  </div>
</template>

<script setup>
// highlight-next-line
import { ref, onMounted } from 'vue'
import { FrontendApi, Configuration } from "@ory/client"

// highlight-start
const basePath = import.meta.env.VUE_APP_ORY_URL || "http://localhost:4000"
const apiUrl = import.meta.env.VUE_APP_API_URL || "http://localhost:8081"

const ory = new FrontendApi(
  new Configuration({
    basePath,
    baseOptions: {
      withCredentials: true,
    },
  }),
)
// highlight-end

// State variables
const session = ref(null)
const logoutUrl = ref(null)
const apiResponse = ref(null)

// Methods
const fetchSession = async () => {
  try {
    // highlight-start
    const { data } = await ory.toSession()
    session.value = data

    // Create logout URL if session exists
    const logoutData = await ory.createBrowserLogoutFlow()
    logoutUrl.value = logoutData.data.logout_url
    // highlight-end
  } catch (error) {
    console.error("Error fetching session:", error)
  }
}

const fetchApiHello = async () => {
  try {
    // highlight-start
    const res = await fetch(`${apiUrl}/api/hello`, {
      credentials: "include",
    })
    
    if (res.ok) {
      const data = await res.json()
      apiResponse.value = data
    }
    // highlight-end
  } catch (error) {
    console.error("Error fetching API response:", error)
  }
}

// Lifecycle hooks
onMounted(async () => {
  console.log("Component mounted")
  await fetchSession()
  await fetchApiHello()
})
</script>

<style scoped>
.main {
  max-width: 400px;
  margin: 0 auto;
}
</style>
