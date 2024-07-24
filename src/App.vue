<template>
  <div class="py-4 px-6" id="app">
    <header>
        <nav class="flex flex-row gap-2">
          <router-link class="uppercase font-semibold" to="/" exact-active-class="text-blue-500 underline">Ekinxoxo</router-link>
          <router-link class="uppercase font-semibold" to="/nono" exact-active-class="text-blue-500 underline">Ekinnono</router-link>
        </nav>
    </header>

    <router-view />
  </div>
</template>