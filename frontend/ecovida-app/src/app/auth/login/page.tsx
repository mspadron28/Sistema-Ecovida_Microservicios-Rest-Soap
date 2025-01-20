'use client'
import { useState } from 'react';
import { signIn } from 'next-auth/react';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        const res = await signIn('credentials', {
            email,    // Usamos email en vez de username
            password,
            callbackUrl: '/pedidos'
        });

        if (res?.error) {
            setError(res.error);  // Mostramos cualquier error que venga de la respuesta
        } else {
            // Aquí podrías redirigir al usuario a otra página, como el dashboard
            console.log("Login successful:", res);
        }
    };

    return (
        <div className="max-w-md mx-auto p-4">
            <h1 className="text-2xl font-semibold mb-4">Login</h1>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                    <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                </div>
                <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
                    <input
                        type="password"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                </div>
                {error && <p className="text-red-600 text-sm">{error}</p>}
                <button type="submit" className="w-full py-2 px-4 bg-cyan-500 text-white rounded-md hover:bg-cyan-600 transition">
                    Login
                </button>
            </form>
        </div>
    );
};

export default Login;
