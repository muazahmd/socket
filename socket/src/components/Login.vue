<template>
  <div class="">
    <form @submit.prevent="login">
      <div class="row justify-content-center">
        <div class="col-md-3">

          <div class="card rounded-0" style="width: 18rem;">
            <h2>Login</h2>
            <div class="card-body">
              <!-- <label for="email">Email:</label> -->
              <input class="form-control border-1 rounded-0 " placeholder="please enter username" v-model="email" type="text" id="email"
                required />
                <button class="btn btn-primary mt-4" type="submit">Login</button>

            </div>
          </div>
        </div>
      </div>

    </form>
    <div v-if="error" class="error">{{ error }}</div>
  </div>
</template>

<script>
import { reactive } from 'vue';
import axios from 'axios';
import { useRouter } from 'vue-router';

export default {
  name: "loginPage",
  setup() {
    const router = useRouter();
    const state = reactive({
      email: '',
    });

    const login = async () => {
      try {
        const response = await axios.post('http://localhost:3000/login', {
          email: state.email,
        });
        localStorage.setItem('token', response.data.token);        // Clear form fields after successful login
        router.push({ path: '/' });
      } catch (error) {
        state.error = 'Invalid credentials. Please try again.';
      }
    };

    return { ...state, login };
  },
};
</script>

<style></style>
